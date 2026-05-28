

// DOM Elements
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const clockElement = document.getElementById('clock');
const shutdownBtn = document.getElementById('shutdownBtn');
const dialogOverlay = document.getElementById('dialogOverlay');
const dialogContent = document.getElementById('dialogContent');
const dialogTitle = document.getElementById('dialogTitle');
const dialogCloseBtn = document.getElementById('dialogCloseBtn');
const dialogOkBtn = document.getElementById('dialogOkBtn');

// State Management
let activeWindow = null;
let dragTarget = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Resize variables
let resizeTarget = null;
let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight, resizeStartTop, resizeStartLeft;
let resizeDirection = null;

// Recycle Bin Data
let deletedItems = [];

// ========== CLOCK ==========
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockElement.innerText = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ========== WINDOW MANAGEMENT ==========
function openWindow(windowId) {
    const win = document.getElementById(`window${windowId.charAt(0).toUpperCase() + windowId.slice(1)}`);
    if (win) {
        win.style.display = 'flex';
        bringToFront(win);
        if (win.dataset.minimized === 'true') {
            win.style.display = 'flex';
            delete win.dataset.minimized;
        }
    }
}

function closeWindow(winElement) {
    if (winElement) winElement.style.display = 'none';
}

function minimizeWindow(winElement) {
    winElement.style.display = 'none';
    winElement.dataset.minimized = 'true';
}

function maximizeWindow(winElement) {
    if (winElement.dataset.maximized === 'true') {
        winElement.style.width = winElement.dataset.prevWidth;
        winElement.style.height = winElement.dataset.prevHeight;
        winElement.style.top = winElement.dataset.prevTop;
        winElement.style.left = winElement.dataset.prevLeft;
        winElement.dataset.maximized = 'false';
        const maxBtn = winElement.querySelector('.maximize-btn');
        if (maxBtn) maxBtn.textContent = '□';
    } else {
        winElement.dataset.prevWidth = winElement.style.width;
        winElement.dataset.prevHeight = winElement.style.height;
        winElement.dataset.prevTop = winElement.style.top;
        winElement.dataset.prevLeft = winElement.style.left;
        
        winElement.style.width = `${window.innerWidth - 8}px`;
        winElement.style.height = `${window.innerHeight - 40}px`;
        winElement.style.top = '4px';
        winElement.style.left = '4px';
        winElement.dataset.maximized = 'true';
        const maxBtn = winElement.querySelector('.maximize-btn');
        if (maxBtn) maxBtn.textContent = '❐';
    }
}

function bringToFront(winElement) {
    const allWindows = document.querySelectorAll('.window');
    let maxZ = 500;
    allWindows.forEach(w => {
        const z = parseInt(window.getComputedStyle(w).zIndex);
        if (!isNaN(z) && z > maxZ) maxZ = z;
    });
    winElement.style.zIndex = maxZ + 1;
    if (activeWindow) activeWindow.classList.remove('active-window');
    activeWindow = winElement;
    activeWindow.classList.add('active-window');
}

// ========== DRAG & DROP ==========
function onMouseDown(e) {
    const win = e.target.closest('.window');
    if (!win || win.style.display !== 'flex') return;
    
    const titlebar = e.target.closest('[data-drag-handle]');
    if (titlebar) {
        e.preventDefault();
        dragTarget = win;
        bringToFront(dragTarget);
        
        const rect = dragTarget.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    const handle = e.target.closest('.resize-handle');
    if (handle) {
        e.preventDefault();
        resizeTarget = win;
        bringToFront(resizeTarget);
        resizeDirection = handle.className.split(' ')[1].replace('resize-', '');
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = win.offsetWidth;
        resizeStartHeight = win.offsetHeight;
        resizeStartTop = win.offsetTop;
        resizeStartLeft = win.offsetLeft;
        
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    }
}

function onMouseMove(e) {
    if (!dragTarget) return;
    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;
    
    newLeft = Math.max(0, Math.min(window.innerWidth - dragTarget.offsetWidth, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - dragTarget.offsetHeight - 32, newTop));
    
    dragTarget.style.left = `${newLeft}px`;
    dragTarget.style.top = `${newTop}px`;
    dragTarget.style.bottom = 'auto';
    dragTarget.style.right = 'auto';
}

function onMouseUp() {
    dragTarget = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// ========== RESIZE ==========
function onResizeMove(e) {
    if (!resizeTarget) return;
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    let newWidth = resizeStartWidth;
    let newHeight = resizeStartHeight;
    let newLeft = resizeStartLeft;
    let newTop = resizeStartTop;
    
    const minWidth = 280;
    const minHeight = 200;
    
    if (resizeDirection.includes('e')) {
        newWidth = Math.max(minWidth, resizeStartWidth + dx);
    }
    if (resizeDirection.includes('w')) {
        newWidth = Math.max(minWidth, resizeStartWidth - dx);
        newLeft = resizeStartLeft + (resizeStartWidth - newWidth);
    }
    if (resizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, resizeStartHeight + dy);
    }
    if (resizeDirection.includes('n')) {
        newHeight = Math.max(minHeight, resizeStartHeight - dy);
        newTop = resizeStartTop + (resizeStartHeight - newHeight);
    }
    
    resizeTarget.style.width = `${newWidth}px`;
    resizeTarget.style.height = `${newHeight}px`;
    resizeTarget.style.left = `${newLeft}px`;
    resizeTarget.style.top = `${newTop}px`;
}

function onResizeUp() {
    resizeTarget = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeUp);
}

// ========== START MENU ==========
startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = startMenu.style.display === 'flex';
    startMenu.style.display = isVisible ? 'none' : 'flex';
});

document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
        startMenu.style.display = 'none';
    }
});

// ========== WINDOW CONTROLS ==========
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const win = btn.closest('.window');
        closeWindow(win);
        e.stopPropagation();
    });
});

document.querySelectorAll('.minimize-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const win = btn.closest('.window');
        minimizeWindow(win);
        e.stopPropagation();
    });
});

document.querySelectorAll('.maximize-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const win = btn.closest('.window');
        maximizeWindow(win);
        e.stopPropagation();
    });
});

// ========== OPEN FROM START MENU / DESKTOP ==========
document.querySelectorAll('[data-window]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const winId = trigger.getAttribute('data-window');
        openWindow(winId);
        startMenu.style.display = 'none';
    });
});

// ========== NOTEPAD FUNCTIONALITY ==========
const notepadText = document.getElementById('notepadText');
const notepadStatus = document.getElementById('notepadStatus');

if (notepadText) {
    notepadText.addEventListener('keyup', () => {
        const lines = notepadText.value.substr(0, notepadText.selectionStart).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        notepadStatus.innerText = `Ln ${line}, Col ${col}`;
    });
    
    notepadText.addEventListener('click', () => {
        const lines = notepadText.value.substr(0, notepadText.selectionStart).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        notepadStatus.innerText = `Ln ${line}, Col ${col}`;
    });
}

// ========== RECYCLE BIN ==========
function updateRecycleBin() {
    const recycleItemsDiv = document.getElementById('recycleItems');
    const emptyMsgDiv = document.getElementById('emptyRecycleMsg');
    
    if (deletedItems.length === 0) {
        emptyMsgDiv.style.display = 'block';
        recycleItemsDiv.style.display = 'none';
    } else {
        emptyMsgDiv.style.display = 'none';
        recycleItemsDiv.style.display = 'flex';
        recycleItemsDiv.innerHTML = deletedItems.map((item, index) => `
            <div class="recycle-item" data-index="${index}">
                <span>🗑️</span>
                <span>${item.name}</span>
                <span style="margin-left: auto; font-size: 10px;">${item.date}</span>
            </div>
        `).join('');
        
        // Add restore functionality to each item
        document.querySelectorAll('.recycle-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const idx = parseInt(item.dataset.index);
                restoreItem(idx);
                e.stopPropagation();
            });
        });
    }
}

function addToRecycleBin(itemName) {
    deletedItems.push({
        name: itemName,
        date: new Date().toLocaleString()
    });
    updateRecycleBin();
    
    // Show confirmation dialog
    // showDialog('Delete Item', `${itemName} has been moved to the Recycle Bin.`);
}

function restoreItem(index) {
    const item = deletedItems[index];
    if (item) {
        deletedItems.splice(index, 1);
        updateRecycleBin();
        showDialog('Restore Item', `${item.name} has been restored.`);
    }
}

function emptyRecycleBin() {
    if (deletedItems.length > 0) {
        showDialog('Empty Recycle Bin', `Are you sure you want to permanently delete ${deletedItems.length} item(s)?`, () => {
            deletedItems = [];
            updateRecycleBin();
            showDialog('Recycle Bin', 'Recycle Bin has been emptied.');
        });
    }
}

function restoreAllItems() {
    if (deletedItems.length > 0) {
        showDialog('Restore All', `Restore all ${deletedItems.length} item(s)?`, () => {
            deletedItems = [];
            updateRecycleBin();
            showDialog('Recycle Bin', 'All items have been restored.');
        });
    }
}

// Add sample items to Recycle Bin for demo
setTimeout(() => {
    addToRecycleBin('old_document.txt');
    addToRecycleBin('setup.exe');
}, 1000);

const emptyRecycleBtn = document.getElementById('emptyRecycleBtn');
const restoreAllBtn = document.getElementById('restoreAllBtn');
if (emptyRecycleBtn) emptyRecycleBtn.addEventListener('click', emptyRecycleBin);
if (restoreAllBtn) restoreAllBtn.addEventListener('click', restoreAllItems);

// ========== CONTROL PANEL ==========
function showDialog(title, message, onOk = null) {
    dialogTitle.innerText = title;
    dialogContent.innerHTML = `<p>${message}</p>`;
    dialogOverlay.style.display = 'flex';
    
    const okHandler = () => {
        dialogOverlay.style.display = 'none';
        if (onOk) onOk();
        dialogOkBtn.removeEventListener('click', okHandler);
        dialogCloseBtn.removeEventListener('click', okHandler);
    };
    
    dialogOkBtn.addEventListener('click', okHandler);
    dialogCloseBtn.addEventListener('click', okHandler);
}

const displaySettings = document.getElementById('displaySettings');
const soundSettings = document.getElementById('soundSettings');
const dateSettings = document.getElementById('dateSettings');
const mouseSettings = document.getElementById('mouseSettings');

if (displaySettings) {
    displaySettings.addEventListener('click', () => {
        showDialog('Display Properties', 'Background Color: Teal\nResolution: 800x600\nColor Quality: 16-bit');
    });
}

if (soundSettings) {
    soundSettings.addEventListener('click', () => {
        showDialog('Sound Properties', 'Sound Scheme: Windows Default\nVolume: 75%\nMute: Off');
    });
}

if (dateSettings) {
    dateSettings.addEventListener('click', () => {
        const now = new Date();
        showDialog('Date/Time Properties', `Date: ${now.toLocaleDateString()}\nTime: ${now.toLocaleTimeString()}\nTime Zone: (UTC) Coordinated Universal Time`);
    });
}

if (mouseSettings) {
    mouseSettings.addEventListener('click', () => {
        showDialog('Mouse Properties', 'Buttons: Left-handed\nPointer Speed: Medium\nDouble-click Speed: Fast');
    });
}

// ========== SHUTDOWN ==========
shutdownBtn.addEventListener('click', () => {
    showDialog('Shutting Down Windows 98', 'It is now safe to turn off your computer.\n(Refresh the page to restart the simulator)', () => {
        document.querySelectorAll('.window').forEach(win => win.style.display = 'none');
        startMenu.style.display = 'none';
    });
});

// ========== DRAG & DROP ITEMS TO RECYCLE BIN ==========
// Make desktop icons draggable to recycle bin
const desktopIcons = document.querySelectorAll('.desktop-icon');
const recycleBinWindow = document.getElementById('windowRecycleBin');

desktopIcons.forEach(icon => {
    icon.setAttribute('draggable', 'true');
    icon.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', icon.querySelector('.icon-text')?.innerText || 'Unknown Item');
        e.dataTransfer.effectAllowed = 'move';
    });
});

if (recycleBinWindow) {
    recycleBinWindow.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    recycleBinWindow.addEventListener('drop', (e) => {
        e.preventDefault();
        const itemName = e.dataTransfer.getData('text/plain');
        if (itemName) {
            addToRecycleBin(itemName);
            // Hide the dragged icon (simulate deletion)
            const draggedIcon = Array.from(desktopIcons).find(icon => 
                icon.querySelector('.icon-text')?.innerText === itemName
            );
            if (draggedIcon) {
                draggedIcon.style.opacity = '0.5';
                setTimeout(() => {
                    draggedIcon.style.opacity = '1';
                }, 1000);
            }
        }
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('mousedown', onMouseDown);

window.addEventListener('load', () => {
    // Set initial positions for all windows
    const windows = document.querySelectorAll('.window');
    const positions = [
        { top: '50px', left: '50px' },      // My Computer
        { top: '100px', left: '150px' },    // Recycle Bin
        { top: '80px', left: '200px' },     // Control Panel
        { top: '120px', left: '100px' }     // Notepad
    ];
    
    windows.forEach((win, index) => {
        if (index < positions.length) {
            win.style.top = positions[index].top;
            win.style.left = positions[index].left;
        }
        if (win.id === 'windowMyComputer') {
            win.style.width = '480px';
            win.style.height = '360px';
        }
        if (win.id === 'windowRecycleBin') {
            win.style.width = '400px';
            win.style.height = '320px';
        }
        if (win.id === 'windowControlPanel') {
            win.style.width = '520px';
            win.style.height = '380px';
        }
        if (win.id === 'windowNotepad') {
            win.style.width = '500px';
            win.style.height = '400px';
        }
    });
});


























// ============================================
// BOOT SCREEN با عکس و صدای خودت
// ============================================

const bootScreen = document.getElementById('bootScreen');
const bootAudio = document.getElementById('bootAudio');
const desktopDiv = document.querySelector('.desktop');
const taskbarDiv = document.querySelector('.taskbar');

const SOUND_DURATION = 4;   // مقدار زمان پخش صدا به ثانیه

desktopDiv.classList.remove('visible');
taskbarDiv.classList.remove('visible');

window.addEventListener('load', () => {
    bootAudio.load();
    
    setTimeout(() => {
        bootAudio.play().catch(err => console.warn('صدا پخش نشد:', err));
        
        setTimeout(() => {
            bootAudio.pause();
            bootAudio.currentTime = 0;
        }, SOUND_DURATION * 1000);
        
        setTimeout(() => {
            bootScreen.classList.add('fade-out');
            
            setTimeout(() => {
                bootScreen.style.display = 'none';
                desktopDiv.classList.add('visible');
                taskbarDiv.classList.add('visible');
            }, 1000);
            
        }, (SOUND_DURATION + 1) * 1000);
        
    }, 100);
});
