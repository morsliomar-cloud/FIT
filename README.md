# Clarity - Motivational Progress Tracker

A minimalist, highly visual Progressive Web Application (PWA) that tracks your journey toward a fitness or personal goal using an image-based focus metaphor.

## Concept

Upload a photo of your ultimate goal. Each day, log your progress. As you get closer to your goal, the image becomes progressively clearer. If you miss days or drift further, the image blurs. Keep your streak alive to maintain a crystal-clear vision of your goal!

## Features

- **Progressive Blur Engine**: Real-time CSS filter mapping progress strictly from 0-100%.
- **Daily Check-Ins**: Seamless +5/-5% increment tracking with built-in daily validation.
- **Streak & Penalty System**: Automatically calculates consecutive days and applies a "vision blur" penalty missing 3+ days.
- **Offline PWA Support**: Full Service Worker caching and IndexedDB persistent storage allow the app to be installed and used entirely offline on mobile iOS/Android and Desktop!
- **Zero Dependencies**: Pure Vanilla JS/CSS/HTML architecture for maximum performance and longevity.

## Deployment to GitHub Pages

This repository is pre-configured with a GitHub Actions workflow that automatically deploys the app to GitHub Pages.

### Instructions:
1. Create a new **public** repository on your GitHub account.
2. Open a terminal in this directory (`C:\Users\ss\.gemini\antigravity\scratch\fitness-journey`).
3. Run the following commands replacing the placeholders:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Clarity tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```
4. On GitHub, go to your repository's **Settings > Pages**.
5. Ensure the **Source** is set to **GitHub Actions**.
6. That's it! GitHub Actions will build and deploy the site. Wait a minute or two and your app will be securely available via a public URL allowing you to install it on your mobile phone's home screen.

## Local Development
Since the app uses IndexedDB and Service Workers, it must be run over HTTP/HTTPS (not `file://`).
You can use any local server, for example:
```bash
npx serve .
```
