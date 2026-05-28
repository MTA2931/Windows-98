

// ============================================
// INTERNET EXPLORER FUNCTIONALITY
// ============================================

const ieFrame = document.getElementById('ieFrame');
const ieAddressBar = document.getElementById('ieAddressBar');
const ieGoBtn = document.getElementById('ieGoBtn');
const ieRefreshBtn = document.getElementById('ieRefreshBtn');
const ieStopBtn = document.getElementById('ieStopBtn');
const ieBackBtn = document.getElementById('ieBackBtn');
const ieForwardBtn = document.getElementById('ieForwardBtn');
const ieStatusText = document.getElementById('ieStatusText');
const ieLoading = document.getElementById('ieLoading');

// History stack for back/forward
let ieHistory = [];
let ieHistoryIndex = -1;

// Loading state
let isLoading = false;
let currentUrl = 'https://www.google.com';

// Function to update address bar and load URL
function loadUrl(url) {
    // Add http:// if no protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    currentUrl = url;
    ieAddressBar.value = url;
    
    // Show loading animation
    isLoading = true;
    ieLoading.style.display = 'flex';
    ieStatusText.innerText = `Connecting to ${new URL(url).hostname}...`;
    
    // Update iframe source
    ieFrame.src = url;
    
    // Hide loading after iframe loads (or timeout)
    const loadHandler = () => {
        setTimeout(() => {
            ieLoading.style.display = 'none';
            isLoading = false;
            ieStatusText.innerText = 'Done';
            updateNavButtons();
        }, 500);
        ieFrame.removeEventListener('load', loadHandler);
    };
    
    ieFrame.addEventListener('load', loadHandler);
    
    // Timeout fallback
    setTimeout(() => {
        if (isLoading) {
            ieLoading.style.display = 'none';
            isLoading = false;
            ieStatusText.innerText = 'Error: Could not connect';
        }
    }, 5000);
    
    // Add to history
    if (ieHistoryIndex < ieHistory.length - 1) {
        ieHistory = ieHistory.slice(0, ieHistoryIndex + 1);
    }
    ieHistory.push(url);
    ieHistoryIndex = ieHistory.length - 1;
    updateNavButtons();
}

// Update back/forward button states
function updateNavButtons() {
    if (ieBackBtn) {
        ieBackBtn.disabled = ieHistoryIndex <= 0;
    }
    if (ieForwardBtn) {
        ieForwardBtn.disabled = ieHistoryIndex >= ieHistory.length - 1;
    }
}

// Back navigation
function goBack() {
    if (ieHistoryIndex > 0) {
        ieHistoryIndex--;
        const url = ieHistory[ieHistoryIndex];
        currentUrl = url;
        ieAddressBar.value = url;
        
        isLoading = true;
        ieLoading.style.display = 'flex';
        ieStatusText.innerText = `Navigating back...`;
        
        ieFrame.src = url;
        
        const loadHandler = () => {
            setTimeout(() => {
                ieLoading.style.display = 'none';
                isLoading = false;
                ieStatusText.innerText = 'Done';
            }, 300);
            ieFrame.removeEventListener('load', loadHandler);
        };
        ieFrame.addEventListener('load', loadHandler);
        updateNavButtons();
    }
}

// Forward navigation
function goForward() {
    if (ieHistoryIndex < ieHistory.length - 1) {
        ieHistoryIndex++;
        const url = ieHistory[ieHistoryIndex];
        currentUrl = url;
        ieAddressBar.value = url;
        
        isLoading = true;
        ieLoading.style.display = 'flex';
        ieStatusText.innerText = `Navigating forward...`;
        
        ieFrame.src = url;
        
        const loadHandler = () => {
            setTimeout(() => {
                ieLoading.style.display = 'none';
                isLoading = false;
                ieStatusText.innerText = 'Done';
            }, 300);
            ieFrame.removeEventListener('load', loadHandler);
        };
        ieFrame.addEventListener('load', loadHandler);
        updateNavButtons();
    }
}

// Refresh page
function refreshPage() {
    if (currentUrl) {
        loadUrl(currentUrl);
    }
}

// Stop loading
function stopLoading() {
    if (isLoading) {
        ieLoading.style.display = 'none';
        isLoading = false;
        ieStatusText.innerText = 'Stopped';
        // Attempt to stop iframe loading
        const blankIframe = document.createElement('iframe');
        blankIframe.style.display = 'none';
        document.body.appendChild(blankIframe);
        ieFrame.src = 'about:blank';
        setTimeout(() => {
            ieFrame.src = currentUrl;
            blankIframe.remove();
        }, 10);
    }
}

// Event Listeners for IE
if (ieGoBtn) {
    ieGoBtn.addEventListener('click', () => {
        const url = ieAddressBar.value.trim();
        if (url) {
            loadUrl(url);
        }
    });
}

if (ieAddressBar) {
    ieAddressBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = ieAddressBar.value.trim();
            if (url) {
                loadUrl(url);
            }
        }
    });
}

if (ieRefreshBtn) {
    ieRefreshBtn.addEventListener('click', refreshPage);
}

if (ieStopBtn) {
    ieStopBtn.addEventListener('click', stopLoading);
}

if (ieBackBtn) {
    ieBackBtn.addEventListener('click', goBack);
}

if (ieForwardBtn) {
    ieForwardBtn.addEventListener('click', goForward);
}

// Update address bar when iframe navigates (same-origin limitation note)
if (ieFrame) {
    // For cross-origin, we can't read the URL, but we can update when user interacts
    ieFrame.addEventListener('load', () => {
        try {
            // Try to get the iframe URL (will work for same-origin)
            const frameUrl = ieFrame.contentWindow.location.href;
            if (frameUrl && frameUrl !== 'about:blank') {
                currentUrl = frameUrl;
                ieAddressBar.value = frameUrl;
                ieStatusText.innerText = 'Done';
            }
        } catch (e) {
            // Cross-origin - can't access URL, that's fine
            ieStatusText.innerText = 'Done';
        }
    });
}

// Initialize IE with Google
setTimeout(() => {
    if (ieFrame && ieAddressBar) {
        // Set initial URL
        currentUrl = 'https://www.google.com';
        ieAddressBar.value = 'https://www.google.com';
        ieHistory = ['https://www.google.com'];
        ieHistoryIndex = 0;
        
        // Load with a slight delay to show loading animation
        isLoading = true;
        ieLoading.style.display = 'flex';
        ieStatusText.innerText = '...';
        
        ieFrame.src = 'https://www.google.com';
        
        const initLoadHandler = () => {
            setTimeout(() => {
                ieLoading.style.display = 'none';
                isLoading = false;
                ieStatusText.innerText = 'Done';
                updateNavButtons();
            }, 800);
            ieFrame.removeEventListener('load', initLoadHandler);
        };
        ieFrame.addEventListener('load', initLoadHandler);
        
        // Fallback timeout
        setTimeout(() => {
            if (isLoading) {
                ieLoading.style.display = 'none';
                isLoading = false;
                ieStatusText.innerText = 'Google loaded (some features may be limited)';
            }
        }, 4000);
    }
}, 100);

