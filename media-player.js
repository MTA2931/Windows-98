

// ============================================
// WINDOWS MEDIA PLAYER 6.4 (Windows 98 Style)
// ============================================

const wmpAudio = document.getElementById('wmpAudio');
const wmpPlayBtn = document.getElementById('wmpPlayBtn');
const wmpPauseBtn = document.getElementById('wmpPauseBtn');
const wmpStopBtn = document.getElementById('wmpStopBtn');
const wmpPrevBtn = document.getElementById('wmpPrevBtn');
const wmpNextBtn = document.getElementById('wmpNextBtn');
const wmpVolumeUpBtn = document.getElementById('wmpVolumeUpBtn');
const wmpVolumeDownBtn = document.getElementById('wmpVolumeDownBtn');
const wmpOpenBtn = document.getElementById('wmpOpenBtn');
const wmpFileInput = document.getElementById('wmpFileInput');
const wmpNowPlaying = document.getElementById('wmpNowPlaying');
const wmpCurrentTime = document.getElementById('wmpCurrentTime');
const wmpTotalTime = document.getElementById('wmpTotalTime');
const wmpProgressBar = document.getElementById('wmpProgressBar');
const wmpProgressFill = document.getElementById('wmpProgressFill');
const wmpProgressHandle = document.getElementById('wmpProgressHandle');
const wmpStatusBar = document.getElementById('wmpStatusBar');
const wmpWaveCanvas = document.getElementById('wmpWaveCanvas');
const eqSliders = document.querySelectorAll('.eq-slider');

// Playlist for demo (simulated)
let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;
let animationId = null;

// Canvas context for visualization
let canvasCtx = null;
if (wmpWaveCanvas) {
    canvasCtx = wmpWaveCanvas.getContext('2d');
    // Set canvas dimensions properly
    wmpWaveCanvas.width = 480;
    wmpWaveCanvas.height = 100;
}

// Demo tracks (sample - user can open their own)
const demoTracks = [
    { name: "Sample - Windows 98 Startup", url: null },
    { name: "Sample - MIDI Classic", url: null }
];

// Update status text
function updateWmpStatus(text) {
    if (wmpStatusBar) wmpStatusBar.innerText = text;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar and time displays
function updateProgress() {
    if (wmpAudio && wmpAudio.duration && !isNaN(wmpAudio.duration)) {
        const percent = (wmpAudio.currentTime / wmpAudio.duration) * 100;
        wmpProgressFill.style.width = `${percent}%`;
        wmpProgressHandle.style.left = `calc(${percent}% - 4px)`;
        wmpCurrentTime.innerText = formatTime(wmpAudio.currentTime);
        wmpTotalTime.innerText = formatTime(wmpAudio.duration);
    }
}

// Visualization animation (fake waves)
function drawWaveform() {
    if (!canvasCtx) return;
    
    canvasCtx.fillStyle = '#000000';
    canvasCtx.fillRect(0, 0, wmpWaveCanvas.width, wmpWaveCanvas.height);
    
    if (isPlaying) {
        // Draw animated waveform
        const now = Date.now() / 200;
        const bars = 40;
        const barWidth = wmpWaveCanvas.width / bars;
        
        for (let i = 0; i < bars; i++) {
            const height = 20 + Math.sin(now + i * 0.3) * 15 + Math.cos(now * 1.7 + i * 0.5) * 10;
            const x = i * barWidth;
            const y = (wmpWaveCanvas.height - height) / 2;
            
            // Green oscilloscope style
            const intensity = isPlaying ? 0 : 0.3;
            canvasCtx.fillStyle = `rgb(0, ${150 + Math.sin(now + i) * 50}, 0)`;
            canvasCtx.fillRect(x, y, barWidth - 2, height);
            
            // Add highlight
            canvasCtx.fillStyle = `rgb(50, 200, 50)`;
            canvasCtx.fillRect(x, y, barWidth - 2, 2);
        }
        
        // Add grid lines (classic WMP style)
        canvasCtx.strokeStyle = '#00ff00';
        canvasCtx.lineWidth = 0.5;
        for (let y = 0; y < wmpWaveCanvas.height; y += 20) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, y);
            canvasCtx.lineTo(wmpWaveCanvas.width, y);
            canvasCtx.stroke();
        }
    } else {
        // Draw flat line when stopped
        canvasCtx.fillStyle = '#003300';
        canvasCtx.fillRect(0, 0, wmpWaveCanvas.width, wmpWaveCanvas.height);
        canvasCtx.fillStyle = '#00ff00';
        canvasCtx.fillRect(0, wmpWaveCanvas.height / 2, wmpWaveCanvas.width, 1);
        
        canvasCtx.fillStyle = '#00aa00';
        canvasCtx.font = '10px "Courier New"';
        canvasCtx.fillText("► Ready to play", 10, wmpWaveCanvas.height - 10);
    }
    
    if (isPlaying) {
        animationId = requestAnimationFrame(drawWaveform);
    }
}

// Start visualization animation
function startVisualization() {
    if (animationId) cancelAnimationFrame(animationId);
    drawWaveform();
}

// Stop visualization
function stopVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    drawWaveform();
}

// Load and play a file
function loadAndPlay(file) {
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    wmpAudio.src = url;
    wmpAudio.load();
    
    wmpNowPlaying.querySelector('.wmp-status-text').innerHTML = `📀 Now Playing: ${file.name}`;
    updateWmpStatus(`Loading ${file.name}...`);
    
    wmpAudio.addEventListener('canplaythrough', () => {
        updateWmpStatus(`Loaded: ${file.name}`);
        wmpAudio.play().then(() => {
            isPlaying = true;
            startVisualization();
            updateWmpStatus(`Playing: ${file.name}`);
        }).catch(e => {
            updateWmpStatus(`Error playing file`);
        });
    });
    
    wmpAudio.addEventListener('timeupdate', updateProgress);
    wmpAudio.addEventListener('ended', () => {
        isPlaying = false;
        stopVisualization();
        updateWmpStatus('Playback finished');
        wmpProgressFill.style.width = '0%';
        wmpCurrentTime.innerText = '00:00';
    });
}

// Open file dialog
if (wmpOpenBtn) {
    wmpOpenBtn.addEventListener('click', () => {
        wmpFileInput.click();
    });
}

if (wmpFileInput) {
    wmpFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|ogg)$/i))) {
            loadAndPlay(file);
        } else {
            updateWmpStatus('Please select an audio file (MP3, WAV, OGG)');
        }
        wmpFileInput.value = '';
    });
}

// Play button
if (wmpPlayBtn) {
    wmpPlayBtn.addEventListener('click', () => {
        if (wmpAudio.src) {
            wmpAudio.play();
            isPlaying = true;
            startVisualization();
            updateWmpStatus('Playing');
        } else {
            updateWmpStatus('No file loaded. Click Open to select a music file.');
        }
    });
}

// Pause button
if (wmpPauseBtn) {
    wmpPauseBtn.addEventListener('click', () => {
        wmpAudio.pause();
        isPlaying = false;
        stopVisualization();
        updateWmpStatus('Paused');
    });
}

// Stop button
if (wmpStopBtn) {
    wmpStopBtn.addEventListener('click', () => {
        wmpAudio.pause();
        wmpAudio.currentTime = 0;
        isPlaying = false;
        stopVisualization();
        updateProgress();
        updateWmpStatus('Stopped');
    });
}

// Volume controls
if (wmpVolumeUpBtn) {
    wmpVolumeUpBtn.addEventListener('click', () => {
        if (wmpAudio.volume < 0.95) {
            wmpAudio.volume += 0.1;
            updateWmpStatus(`Volume: ${Math.round(wmpAudio.volume * 100)}%`);
        }
    });
}

if (wmpVolumeDownBtn) {
    wmpVolumeDownBtn.addEventListener('click', () => {
        if (wmpAudio.volume > 0.05) {
            wmpAudio.volume -= 0.1;
            updateWmpStatus(`Volume: ${Math.round(wmpAudio.volume * 100)}%`);
        }
    });
}

// Progress bar seeking
if (wmpProgressBar) {
    wmpProgressBar.addEventListener('click', (e) => {
        if (wmpAudio.duration) {
            const rect = wmpProgressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            wmpAudio.currentTime = percent * wmpAudio.duration;
            updateProgress();
        }
    });
}

// Equalizer interaction (visual only - classic WMP style)
eqSliders.forEach((slider, index) => {
    const bar = slider.querySelector('.eq-slider-bar');
    let currentHeight = parseInt(bar.style.height) || 50;
    
    slider.addEventListener('click', (e) => {
        const rect = slider.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percent = ((rect.height - y) / rect.height) * 100;
        currentHeight = Math.min(100, Math.max(10, percent));
        bar.style.height = `${currentHeight}%`;
        updateWmpStatus(`EQ Band ${index + 1}: ${Math.round(currentHeight)}%`);
    });
    
    slider.addEventListener('mousedown', () => {
        const onMouseMove = (e) => {
            const rect = slider.getBoundingClientRect();
            let y = e.clientY - rect.top;
            y = Math.min(rect.height, Math.max(0, y));
            const percent = ((rect.height - y) / rect.height) * 100;
            currentHeight = Math.min(100, Math.max(10, percent));
            bar.style.height = `${currentHeight}%`;
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
});

// Prev/Next buttons (demo functionality)
if (wmpPrevBtn) {
    wmpPrevBtn.addEventListener('click', () => {
        updateWmpStatus('Previous track (add more files to playlist)');
    });
}

if (wmpNextBtn) {
    wmpNextBtn.addEventListener('click', () => {
        updateWmpStatus('Next track (add more files to playlist)');
    });
}

// Initialize visualization
startVisualization();

// Set initial status
updateWmpStatus('Ready. Click Open to play MP3/WAV/OGG files.');

