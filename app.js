document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const elements = {
        setupView: document.getElementById('setupView'),
        dashboardView: document.getElementById('dashboardView'),
        imageUpload: document.getElementById('imageUpload'),
        uploadTriggerBtn: document.getElementById('uploadTriggerBtn'),
        uploadDropzone: document.getElementById('uploadDropzone'),
        goalImage: document.getElementById('goalImage'),
        progressText: document.getElementById('progressText'),
        progressUpBtn: document.getElementById('progressUpBtn'),
        progressDownBtn: document.getElementById('progressDownBtn'),
        streakCount: document.getElementById('streakCount'),
        maxStreakCount: document.getElementById('maxStreakCount'),
        settingsBtn: document.getElementById('settingsBtn'),
        modalOverlay: document.getElementById('modalOverlay'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        resetProgressBtn: document.getElementById('resetProgressBtn'),
        enableNotificationsBtn: document.getElementById('enableNotificationsBtn')
    };

    // Default State
    let state = {
        progress: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastCheckIn: null, // timestamp
        totalCheckIns: 0
    };

    // App Initialization
    const initApp = async () => {
        try {
            await window.storage.initDB();

            // Load state
            const savedState = await window.storage.getState();
            if (savedState) {
                state = { ...state, ...savedState };
            }

            // Load image
            const imageUrl = await window.storage.getImage();
            if (imageUrl) {
                elements.goalImage.src = imageUrl;
                showDashboard();
                checkPenalties();
                updateUI();
            } else {
                showSetup();
            }
        } catch (error) {
            console.error('Failed to initialize app state:', error);
        }
    };

    // Logic functions
    const showSetup = () => {
        elements.setupView.classList.remove('hidden');
        elements.dashboardView.classList.add('hidden');
    };

    const showDashboard = () => {
        elements.dashboardView.classList.remove('hidden');
        elements.setupView.classList.add('hidden');
    };

    const MAX_BLUR = 24; // Align with CSS variable --blur-max
    const updateUI = () => {
        // Update stats
        elements.progressText.innerText = `${state.progress}%`;
        elements.streakCount.innerText = `${state.currentStreak} Days`;
        elements.maxStreakCount.innerText = `${state.maxStreak} Days`;

        // Update blur logic - map 0-100 progress to MAX_BLUR -> 0 blur
        const currentBlur = ((100 - state.progress) / 100) * MAX_BLUR;
        elements.goalImage.style.filter = `blur(${currentBlur}px)`;

        // Slightly amplify the text momentarily to give feedback
        elements.progressText.style.transform = 'scale(1.1)';
        setTimeout(() => {
            elements.progressText.style.transform = 'scale(1)';
        }, 300);

        // Save state persistently
        window.storage.saveState(state).catch(e => console.error("Could not save state", e));
    };

    const handleProgress = (amount) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (state.lastCheckIn) {
            const lastCheckDate = new Date(state.lastCheckIn);
            const lastDateMidnight = new Date(lastCheckDate.getFullYear(), lastCheckDate.getMonth(), lastCheckDate.getDate()).getTime();

            const diffDays = Math.round((today - lastDateMidnight) / (1000 * 60 * 60 * 24));

            if (diffDays === 1 && amount > 0) {
                // Streak continues!
                state.currentStreak += 1;
            } else if (diffDays > 1) {
                // Broken streak
                state.currentStreak = (amount > 0) ? 1 : 0;
            } else if (diffDays === 0 && state.currentStreak === 0 && amount > 0) {
                // Initiated today
                state.currentStreak = 1;
            }
        } else if (amount > 0) {
            state.currentStreak = 1;
        }

        if (state.currentStreak > state.maxStreak) {
            state.maxStreak = state.currentStreak;
        }

        // Apply progress, bound between 0 and 100
        state.progress = Math.max(0, Math.min(100, state.progress + amount));
        state.lastCheckIn = now.getTime();
        state.totalCheckIns += 1;

        updateUI();

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(amount > 0 ? [50, 50] : [100]);
        }
    };

    // Penalize user if inactive for 3+ days
    const checkPenalties = () => {
        if (!state.lastCheckIn || state.progress === 0) return;

        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);

        const lastCheckDate = new Date(state.lastCheckIn);
        lastCheckDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round((todayMidnight.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60 * 24));

        // 3 days missed triggers penalty
        if (diffDays >= 3) {
            const penaltyPeriods = diffDays - 2; // day 3 = 1 penalty, day 4 = 2, etc.
            const penaltyAmount = penaltyPeriods * 15; // 15% drop per penalized day

            state.progress = Math.max(0, state.progress - penaltyAmount);
            state.currentStreak = 0;
            // Reset last check-in date so consecutive logic isn't triggered indefinitely until user opens app again
            // To be fair, setting it to "2 days ago" allows the system to penalize once tomorrow if they miss again.
            const twoDaysAgo = new Date(todayMidnight.getTime() - (2 * 24 * 60 * 60 * 1000)).getTime();
            state.lastCheckIn = twoDaysAgo;

            alert(`You missed some check-ins. Your vision has blurred by ${penaltyAmount}% as a penalty. Keep pushing!`);
        }
    };

    // Setup Listeners
    elements.uploadDropzone.addEventListener('click', () => {
        elements.imageUpload.click();
    });

    elements.imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file.');
                    return;
                }
                await window.storage.saveImage(file);
                // Reset state
                state.progress = 0;
                state.currentStreak = 0;

                const imageUrl = await window.storage.getImage();
                elements.goalImage.src = imageUrl;

                showDashboard();
                updateUI();
            } catch (err) {
                console.error('Failed to save image', err);
                alert('An error occurred while saving the image.');
            }
        }
    });

    // Action button listeners
    elements.progressUpBtn.addEventListener('click', () => handleProgress(5));
    elements.progressDownBtn.addEventListener('click', () => handleProgress(-5));

    // Settings / Modals
    elements.settingsBtn.addEventListener('click', () => {
        elements.modalOverlay.classList.remove('hidden');
    });

    elements.closeModalBtn.addEventListener('click', () => {
        elements.modalOverlay.classList.add('hidden');
    });

    elements.resetProgressBtn.addEventListener('click', async () => {
        if (confirm("Are you sure you want to delete your progress and start over? This cannot be undone.")) {
            await window.storage.clearData();
            state.progress = 0;
            state.currentStreak = 0;
            state.totalCheckIns = 0;
            state.lastCheckIn = null;
            elements.goalImage.src = '';

            elements.modalOverlay.classList.add('hidden');
            showSetup();
        }
    });

    elements.enableNotificationsBtn.addEventListener('click', () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    alert("Notifications enabled! Daily reminders activated.");
                    elements.modalOverlay.classList.add('hidden');
                } else {
                    alert("Notification permission denied.");
                }
            });
        } else {
            alert("Your browser does not support notifications.");
        }
    });

    // Start
    initApp();
});
