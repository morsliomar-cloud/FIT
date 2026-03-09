const DB_NAME = 'ClarityGoalDB';
const DB_VERSION = 1;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (e) => reject('IndexedDB error', e);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('userData')) {
                db.createObjectStore('userData', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (e) => resolve(e.target.result);
    });
};

const saveState = async (state) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userData', 'readwrite');
        const store = tx.objectStore('userData');
        store.put({ id: 'appState', ...state });
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e);
    });
};

const getState = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userData', 'readonly');
        const store = tx.objectStore('userData');
        const request = store.get('appState');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e);
    });
};

const saveImage = async (file) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userData', 'readwrite');
        const store = tx.objectStore('userData');
        store.put({ id: 'goalImage', blob: file });
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e);
    });
};

const getImage = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userData', 'readonly');
        const store = tx.objectStore('userData');
        const request = store.get('goalImage');
        request.onsuccess = () => {
            if (request.result && request.result.blob) {
                resolve(URL.createObjectURL(request.result.blob));
            } else {
                resolve(null);
            }
        };
        request.onerror = (e) => reject(e);
    });
};

const clearData = async () => {
     const db = await initDB();
     return new Promise((resolve, reject) => {
         const tx = db.transaction('userData', 'readwrite');
         tx.objectStore('userData').clear();
         tx.oncomplete = () => resolve();
         tx.onerror = (e) => reject(e);
     });
}

window.storage = { initDB, saveState, getState, saveImage, getImage, clearData };
