/**
 * KJV Harmonizer - Main Application JavaScript
 * Progressive Web App for Bible Study
 */

// Application State
const app = {
    currentSection: 'harmony',
    bookmarks: [],
    deferredPrompt: null
};

/**
 * Sanitize a string for safe use in HTML attributes
 * Escapes special characters to prevent XSS
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\\/g, '&#92;');
}

/**
 * Sanitize a string for safe use in JavaScript string literals
 */
function escapeForJs(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

// DOM Elements
const elements = {
    menuBtn: document.getElementById('menuBtn'),
    sidebar: document.getElementById('sidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    searchBtn: document.getElementById('searchBtn'),
    searchModal: document.getElementById('searchModal'),
    closeSearch: document.getElementById('closeSearch'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    eventSelect: document.getElementById('eventSelect'),
    harmonyGrid: document.getElementById('harmonyGrid'),
    installPrompt: document.getElementById('installPrompt'),
    installBtn: document.getElementById('installBtn'),
    dismissInstall: document.getElementById('dismissInstall')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initHarmony();
    initParallelView();
    initMainSearch();
    initBookmarks();
    initInstallPrompt();
    registerServiceWorker();
});

// Navigation Functions
function initNavigation() {
    // Menu toggle
    elements.menuBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('active');
    });
    
    elements.closeSidebar.addEventListener('click', closeSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Navigation links
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            navigateToSection(section);
            closeSidebar();
        });
    });
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('active');
}

function navigateToSection(sectionName) {
    // Update active nav link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionName);
    });
    
    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(`${sectionName}Section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    app.currentSection = sectionName;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search Modal Functions
function initSearch() {
    elements.searchBtn.addEventListener('click', () => {
        elements.searchModal.classList.add('active');
        elements.searchInput.focus();
    });
    
    elements.closeSearch.addEventListener('click', closeSearchModal);
    
    elements.searchModal.addEventListener('click', (e) => {
        if (e.target === elements.searchModal) {
            closeSearchModal();
        }
    });
    
    // Search on input
    let searchTimeout;
    elements.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performQuickSearch(elements.searchInput.value);
        }, 300);
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearchModal();
            closeSidebar();
        }
    });
}

function closeSearchModal() {
    elements.searchModal.classList.remove('active');
    elements.searchInput.value = '';
    elements.searchResults.innerHTML = '';
}

function performQuickSearch(term) {
    if (term.length < 2) {
        elements.searchResults.innerHTML = '<p class="placeholder-text">Enter at least 2 characters to search</p>';
        return;
    }
    
    const results = searchVerses(term);
    displayQuickSearchResults(results.slice(0, 10), term);
}

function displayQuickSearchResults(results, term) {
    if (results.length === 0) {
        elements.searchResults.innerHTML = '<p class="placeholder-text">No results found</p>';
        return;
    }
    
    const html = results.map(result => {
        const safeRef = escapeHtml(`${result.book} ${result.chapter}:${result.verse}`);
        const highlightedText = highlightTerm(escapeHtml(result.text), term);
        return `
            <div class="search-result-item" data-ref="${safeRef}">
                <div class="reference">${safeRef}</div>
                <div class="preview">${highlightedText}</div>
            </div>
        `;
    }).join('');
    
    elements.searchResults.innerHTML = html;
    
    // Add click handlers
    elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const ref = item.dataset.ref;
            closeSearchModal();
            // Navigate to parallel view with this verse
            document.getElementById('leftReference').value = ref;
            loadParallelVerse('left', ref);
            navigateToSection('parallel');
        });
    });
}

function highlightTerm(text, term) {
    // Escape the term for regex, then find matches and wrap in highlight span
    const safeTerm = escapeHtml(term);
    const regex = new RegExp(`(${escapeRegExp(safeTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Harmony Functions
function initHarmony() {
    const events = getHarmonyEvents();
    
    // Populate event selector
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title;
        elements.eventSelect.appendChild(option);
    });
    
    // Handle event selection
    elements.eventSelect.addEventListener('change', () => {
        const eventId = parseInt(elements.eventSelect.value);
        if (eventId) {
            displayHarmonyEvent(eventId);
        } else {
            clearHarmonyDisplay();
        }
    });
}

function displayHarmonyEvent(eventId) {
    const event = getHarmonyEvent(eventId);
    if (!event) return;
    
    const passages = getHarmonyPassages(event);
    
    const gospels = ['matthew', 'mark', 'luke', 'john'];
    gospels.forEach(gospel => {
        const content = document.getElementById(`${gospel}Content`);
        if (passages[gospel]) {
            content.innerHTML = formatPassageHTML(passages[gospel]);
        } else {
            content.innerHTML = '<p class="no-account">This event is not recorded in this Gospel</p>';
        }
    });
}

function formatPassageHTML(passage) {
    let html = `<p class="reference-label"><strong>${escapeHtml(passage.reference)}</strong></p>`;
    
    passage.verses.forEach(v => {
        html += `<p class="verse"><span class="verse-num">${escapeHtml(String(v.verse))}</span>${escapeHtml(v.text)}</p>`;
    });
    
    return html;
}

function clearHarmonyDisplay() {
    const gospels = ['matthew', 'mark', 'luke', 'john'];
    const names = {
        matthew: "Matthew's",
        mark: "Mark's",
        luke: "Luke's",
        john: "John's"
    };
    
    gospels.forEach(gospel => {
        const content = document.getElementById(`${gospel}Content`);
        content.innerHTML = `<p class="placeholder-text">Select an event to view ${names[gospel]} account</p>`;
    });
}

// Parallel View Functions
function initParallelView() {
    document.querySelectorAll('.load-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            const inputId = panel === 'left' ? 'leftReference' : 'rightReference';
            const reference = document.getElementById(inputId).value;
            loadParallelVerse(panel, reference);
        });
    });
    
    // Load on enter key
    document.getElementById('leftReference').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadParallelVerse('left', e.target.value);
        }
    });
    
    document.getElementById('rightReference').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadParallelVerse('right', e.target.value);
        }
    });
}

function loadParallelVerse(panel, reference) {
    const panelElement = document.getElementById(`${panel}Panel`);
    
    const parsed = parseReference(reference);
    if (!parsed) {
        panelElement.innerHTML = '<p class="placeholder-text" style="color: #dc2626;">Invalid reference format. Try: John 3:16 or Matthew 5:1-12</p>';
        return;
    }
    
    const { book, chapter, startVerse, endVerse } = parsed;
    const verses = getVerses(book, chapter.toString(), startVerse, endVerse);
    
    if (verses.length === 0) {
        panelElement.innerHTML = `<p class="placeholder-text">Verse not found in database. Try another reference.</p>`;
        return;
    }
    
    const refText = endVerse !== startVerse 
        ? `${book} ${chapter}:${startVerse}-${endVerse}`
        : `${book} ${chapter}:${startVerse}`;
    
    const safeRefText = escapeHtml(refText);
    const combinedText = verses.map(v => v.text).join(' ');
    
    let html = `<h4>${safeRefText}</h4>`;
    verses.forEach(v => {
        html += `<p class="verse"><span class="verse-num">${escapeHtml(String(v.verse))}</span>${escapeHtml(v.text)}</p>`;
    });
    
    // Add bookmark button - store data attributes instead of inline onclick
    html += `<button class="secondary-btn bookmark-btn" style="margin-top: 16px;" data-ref="${safeRefText}" data-text="${escapeHtml(combinedText)}">
        ★ Bookmark
    </button>`;
    
    panelElement.innerHTML = html;
    
    // Attach event listener for bookmark button
    const bookmarkBtn = panelElement.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            addBookmark(bookmarkBtn.dataset.ref, bookmarkBtn.dataset.text);
        });
    }
}

function parseReference(reference) {
    // Parse common reference formats like "John 3:16" or "Matthew 5:1-12"
    const match = reference.trim().match(/^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    
    if (!match) return null;
    
    let book = match[1].trim();
    // Capitalize first letter
    book = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    
    // Handle common abbreviations
    const bookMap = {
        'Matt': 'Matthew',
        'Mt': 'Matthew',
        'Mk': 'Mark',
        'Lk': 'Luke',
        'Jn': 'John',
        'Jhn': 'John'
    };
    
    if (bookMap[book]) {
        book = bookMap[book];
    }
    
    return {
        book: book,
        chapter: parseInt(match[2]),
        startVerse: parseInt(match[3]),
        endVerse: match[4] ? parseInt(match[4]) : parseInt(match[3])
    };
}

// Main Search Section Functions
function initMainSearch() {
    const searchBtn = document.getElementById('mainSearchBtn');
    const searchInput = document.getElementById('mainSearchInput');
    
    searchBtn.addEventListener('click', () => {
        performMainSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performMainSearch(searchInput.value);
        }
    });
}

function performMainSearch(term) {
    if (term.length < 2) {
        document.getElementById('mainSearchResults').innerHTML = 
            '<p class="placeholder-text">Enter at least 2 characters to search</p>';
        return;
    }
    
    // Get selected books
    const books = [];
    if (document.getElementById('filterMatthew').checked) books.push('Matthew');
    if (document.getElementById('filterMark').checked) books.push('Mark');
    if (document.getElementById('filterLuke').checked) books.push('Luke');
    if (document.getElementById('filterJohn').checked) books.push('John');
    
    if (books.length === 0) {
        document.getElementById('mainSearchResults').innerHTML = 
            '<p class="placeholder-text">Please select at least one Gospel to search</p>';
        return;
    }
    
    const results = searchVerses(term, books);
    displayMainSearchResults(results, term);
}

function displayMainSearchResults(results, term) {
    const container = document.getElementById('mainSearchResults');
    
    if (results.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No results found</p>';
        return;
    }
    
    const html = results.map(result => {
        const safeRef = escapeHtml(`${result.book} ${result.chapter}:${result.verse}`);
        const safeText = escapeHtml(result.text);
        const highlightedText = highlightTerm(safeText, term);
        return `
            <div class="search-result-item" data-ref="${safeRef}">
                <div class="reference">${safeRef}</div>
                <div class="preview">${highlightedText}</div>
                <button class="secondary-btn search-bookmark-btn" style="margin-top: 8px; padding: 4px 8px; font-size: 0.8rem;" 
                    data-ref="${safeRef}" data-text="${safeText}">
                    ★ Bookmark
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<p style="margin-bottom: 16px; color: var(--text-muted);">${results.length} result${results.length !== 1 ? 's' : ''} found</p>` + html;
    
    // Attach event listeners for bookmark buttons
    container.querySelectorAll('.search-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addBookmark(btn.dataset.ref, btn.dataset.text);
        });
    });
}

// Bookmarks Functions
function initBookmarks() {
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('kjv-harmonizer-bookmarks');
    if (saved) {
        app.bookmarks = JSON.parse(saved);
        displayBookmarks();
    }
}

function addBookmark(reference, text) {
    // Check if already bookmarked
    if (app.bookmarks.find(b => b.reference === reference)) {
        alert('This verse is already bookmarked!');
        return;
    }
    
    const bookmark = {
        id: Date.now(),
        reference: reference,
        text: text,
        note: '',
        dateAdded: new Date().toISOString()
    };
    
    app.bookmarks.push(bookmark);
    saveBookmarks();
    displayBookmarks();
    alert('Bookmark added!');
}

function removeBookmark(id) {
    app.bookmarks = app.bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    displayBookmarks();
}

function saveBookmarks() {
    localStorage.setItem('kjv-harmonizer-bookmarks', JSON.stringify(app.bookmarks));
}

function displayBookmarks() {
    const container = document.getElementById('bookmarksList');
    
    if (app.bookmarks.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No bookmarks saved yet. Click the bookmark icon on any verse to save it.</p>';
        return;
    }
    
    const html = app.bookmarks.map(bookmark => `
        <div class="bookmark-item" data-id="${escapeHtml(String(bookmark.id))}">
            <div class="reference">${escapeHtml(bookmark.reference)}</div>
            <div class="text">${escapeHtml(bookmark.text)}</div>
            ${bookmark.note ? `<div class="note">${escapeHtml(bookmark.note)}</div>` : ''}
            <div class="actions">
                <button class="secondary-btn view-bookmark-btn" data-ref="${escapeHtml(bookmark.reference)}">View</button>
                <button class="secondary-btn remove-bookmark-btn" style="color: #dc2626; border-color: #dc2626;" data-id="${escapeHtml(String(bookmark.id))}">Remove</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Attach event listeners
    container.querySelectorAll('.view-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            viewBookmark(btn.dataset.ref);
        });
    });
    
    container.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeBookmark(parseInt(btn.dataset.id, 10));
        });
    });
}

function viewBookmark(reference) {
    document.getElementById('leftReference').value = reference;
    loadParallelVerse('left', reference);
    navigateToSection('parallel');
}

// PWA Install Functions
function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        app.deferredPrompt = e;
        
        // Show install prompt after a delay
        setTimeout(() => {
            elements.installPrompt.classList.add('show');
        }, 3000);
    });
    
    elements.installBtn.addEventListener('click', async () => {
        if (app.deferredPrompt) {
            app.deferredPrompt.prompt();
            const { outcome } = await app.deferredPrompt.userChoice;
            console.log(`User ${outcome} the install`);
            app.deferredPrompt = null;
        }
        elements.installPrompt.classList.remove('show');
    });
    
    elements.dismissInstall.addEventListener('click', () => {
        elements.installPrompt.classList.remove('show');
    });
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

// Make functions globally available
window.addBookmark = addBookmark;
window.removeBookmark = removeBookmark;
window.viewBookmark = viewBookmark;
