# KJV Harmonizer

**Unbiased whole counsel, whole context, wholly harmonious**

A Progressive Web App (PWA) for studying the King James Version Bible with a focus on Gospel harmony.

## Features

- 📖 **Gospel Harmony** - Compare parallel passages from Matthew, Mark, Luke, and John side by side
- 🔍 **Search** - Find verses containing specific words or phrases
- 📱 **Parallel View** - Display any two Bible passages for comparison
- ⭐ **Bookmarks** - Save your favorite verses with personal notes
- 📲 **Install as App** - Works offline and can be installed on your device

## Getting Started

### Running Locally

1. Clone this repository
2. Serve the files with any web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open http://localhost:8000 in your browser

### Installing as PWA

1. Open the app in Chrome, Edge, or Safari
2. Look for the "Install" prompt or use browser menu
3. The app will install to your device's home screen
4. Works offline once installed!

## Project Structure

```
KJV-Harmonizer/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline support
├── css/
│   └── styles.css      # App styling
├── js/
│   ├── app.js          # Main application logic
│   ├── kjv-data.js     # KJV Bible data (selected passages)
│   └── harmony-data.js # Gospel harmony mapping
└── icons/
    ├── icon-*.png      # App icons
    └── screenshot-*.png # PWA screenshots
```

## Scripture Source

This app uses the King James Version (KJV) of the Holy Bible, which is in the public domain.

## License

This project is open source and available for Bible study purposes.
