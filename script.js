/**
 * QR Code Studio Pro - Main Logic & Controller (script.js)
 * Designed & Deployed by Jatin Jangid
 */

let currentTab = 'url';
let currentData = '';
let qrInstance = null;
let debounceTimer = null;
let scannerStream = null;
let isScanningCamera = false;

/* ===== THEME SWITCHER LOGIC ===== */
function initTheme() {
    const savedTheme = localStorage.getItem('qr_studio_theme');
    if (savedTheme === 'dark') {
        applyTheme('dark', false);
    } else {
        applyTheme('light', false);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    applyTheme(isDark ? 'light' : 'dark', true);
}

function applyTheme(theme, notify = true) {
    const themeBtnIcon = document.getElementById('theme-icon');
    const themeBtnText = document.getElementById('theme-text');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('qr_studio_theme', 'dark');
        if (themeBtnIcon) themeBtnIcon.textContent = '☀️';
        if (themeBtnText) themeBtnText.textContent = 'Light Mode';
        if (notify) showToast('🌙 Dark Mode Activated', '✨');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('qr_studio_theme', 'light');
        if (themeBtnIcon) themeBtnIcon.textContent = '🌙';
        if (themeBtnText) themeBtnText.textContent = 'Dark Mode';
        if (notify) showToast('☀️ Light Mode Activated', '✨');
    }
}

function switchTab(tab) {
    currentTab = tab;
    
    // Stop camera if leaving scanner tab
    if (tab !== 'scanner' && isScanningCamera) {
        stopCameraScanner();
    }

    // Update tab button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById('tab-' + tab);
    if (activeBtn) activeBtn.classList.add('active');

    // Toggle tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    const activeContent = document.getElementById('content-' + tab);
    if (activeContent) activeContent.classList.remove('hidden');

    if (tab !== 'scanner') {
        updateQR();
    }
}

function debounceUpdateQR() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateQR, 80);
}

function updateQR() {
    if (currentTab === 'scanner') return;

    let data = '';

    if (currentTab === 'url') {
        const url = document.getElementById('url-input').value.trim();
        if (url) {
            data = url.match(/^https?:\/\//i) ? url : 'https://' + url;
        }
    } 
    else if (currentTab === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const pass = document.getElementById('wifi-pass').value;
        const type = document.getElementById('wifi-type').value;
        const hidden = document.getElementById('wifi-hidden').checked;
        if (ssid) {
            data = `WIFI:S:${escapeWifi(ssid)};T:${type};P:${escapeWifi(pass)};H:${hidden};;`;
        }
    } 
    else if (currentTab === 'contact') {
        const fn = document.getElementById('contact-fn').value.trim();
        const ln = document.getElementById('contact-ln').value.trim();
        const ph = document.getElementById('contact-phone').value.trim();
        const em = document.getElementById('contact-email').value.trim();
        const org = document.getElementById('contact-org').value.trim();
        const title = document.getElementById('contact-title').value.trim();
        const url = document.getElementById('contact-url').value.trim();

        if (fn || ln || ph || em || org) {
            data = `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn};;;\nFN:${fn} ${ln}\nORG:${org}\nTITLE:${title}\nTEL;TYPE=CELL:${ph}\nEMAIL:${em}\nURL:${url}\nEND:VCARD`;
        }
    } 
    else if (currentTab === 'upi') {
        const vpa = document.getElementById('upi-vpa').value.trim();
        const name = document.getElementById('upi-name').value.trim();
        const amount = document.getElementById('upi-amount').value.trim();
        const note = document.getElementById('upi-note').value.trim();
        if (vpa) {
            let upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}`;
            if (name) upiUrl += `&pn=${encodeURIComponent(name)}`;
            if (amount && Number(amount) > 0) upiUrl += `&am=${encodeURIComponent(amount)}&cu=INR`;
            if (note) upiUrl += `&tn=${encodeURIComponent(note)}`;
            data = upiUrl;
        }
    } 
    else if (currentTab === 'text') {
        const txt = document.getElementById('text-input').value;
        document.getElementById('char-count').textContent = `${txt.length} characters`;
        data = txt.trim();
    } 
    else if (currentTab === 'email') {
        const to = document.getElementById('email-to').value.trim();
        const subject = document.getElementById('email-subject').value.trim();
        const body = document.getElementById('email-body').value;
        if (to) {
            data = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    } 
    else if (currentTab === 'phone') {
        const phone = document.getElementById('phone-number').value.trim();
        const mode = document.querySelector('input[name="phone-mode"]:checked')?.value || 'tel';
        const smsMsg = document.getElementById('sms-message').value;

        if (phone) {
            if (mode === 'sms') {
                data = `SMSTO:${phone}:${smsMsg}`;
            } else {
                data = `tel:${phone}`;
            }
        }
    }

    currentData = data;

    const placeholder = document.getElementById('placeholder-box');
    const qrWrapper = document.getElementById('qr-wrapper');
    const actionButtons = document.getElementById('qr-action-buttons');
    const inspector = document.getElementById('data-inspector');
    const inspectorContent = document.getElementById('data-inspector-content');
    const dataLengthBadge = document.getElementById('data-length-badge');

    if (data) {
        renderQRCode(data);
        placeholder.classList.add('hidden');
        qrWrapper.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        inspector.classList.remove('hidden');
        inspectorContent.textContent = data;
        dataLengthBadge.textContent = `${new Blob([data]).size} bytes`;

        // Update frame label
        const frameText = document.getElementById('qr-frame-text').value.trim();
        const bottomLabel = document.getElementById('qr-bottom-label');
        if (frameText) {
            bottomLabel.textContent = frameText;
            bottomLabel.classList.remove('hidden');
        } else {
            bottomLabel.classList.add('hidden');
        }

        // Center Icon Overlay
        updateBadgeOverlay();
    } else {
        clearQR();
        placeholder.classList.remove('hidden');
        qrWrapper.classList.add('hidden');
        actionButtons.classList.add('hidden');
        inspector.classList.add('hidden');
    }
}

function escapeWifi(str) {
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:');
}

function renderQRCode(text) {
    const container = document.getElementById('qrcode');
    container.innerHTML = '';

    const fgColor = document.getElementById('qr-color-fg').value;
    const bgColor = document.getElementById('qr-color-bg').value;
    const ecLevelStr = document.getElementById('qr-ec-level').value;
    const size = parseInt(document.getElementById('qr-size-select').value) || 320;

    const ecMap = {
        'L': QRCode.CorrectLevel.L,
        'M': QRCode.CorrectLevel.M,
        'Q': QRCode.CorrectLevel.Q,
        'H': QRCode.CorrectLevel.H
    };

    if (window.QRCode) {
        qrInstance = new QRCode(container, {
            text: text,
            width: size,
            height: size,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: ecMap[ecLevelStr] || QRCode.CorrectLevel.M
        });
    } else {
        setTimeout(() => renderQRCode(text), 100);
    }
}

function clearQR() {
    document.getElementById('qrcode').innerHTML = '';
    qrInstance = null;
}

function updateBadgeOverlay() {
    const badgeSelect = document.getElementById('qr-center-icon').value;
    const overlay = document.getElementById('qr-icon-overlay');
    const iconElem = document.getElementById('qr-badge-icon');
    const logoImg = document.getElementById('qr-badge-logo-img');

    const icons = {
        'star': '⭐',
        'lock': '🔒',
        'check': '✅',
        'qr': '⚡'
    };

    if (badgeSelect === 'logo') {
        if (iconElem) iconElem.classList.add('hidden');
        if (logoImg) logoImg.classList.remove('hidden');
        overlay.classList.remove('hidden');
    } else if (badgeSelect !== 'none' && icons[badgeSelect]) {
        if (logoImg) logoImg.classList.add('hidden');
        if (iconElem) {
            iconElem.textContent = icons[badgeSelect];
            iconElem.classList.remove('hidden');
        }
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function setFgColor(hex) {
    document.getElementById('qr-color-fg').value = hex;
    updateQR();
}

function setBgColor(hex) {
    document.getElementById('qr-color-bg').value = hex;
    updateQR();
}

function togglePhoneMode() {
    const mode = document.querySelector('input[name="phone-mode"]:checked')?.value;
    const smsContainer = document.getElementById('sms-msg-container');
    if (mode === 'sms') {
        smsContainer.classList.remove('hidden');
    } else {
        smsContainer.classList.add('hidden');
    }
}

function clearAllFields() {
    document.getElementById('url-input').value = '';
    document.getElementById('wifi-ssid').value = '';
    document.getElementById('wifi-pass').value = '';
    document.getElementById('contact-fn').value = '';
    document.getElementById('contact-ln').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-org').value = '';
    document.getElementById('contact-title').value = '';
    document.getElementById('contact-url').value = '';
    document.getElementById('upi-vpa').value = '';
    document.getElementById('upi-name').value = '';
    document.getElementById('upi-amount').value = '';
    document.getElementById('upi-note').value = '';
    document.getElementById('text-input').value = '';
    document.getElementById('email-to').value = '';
    document.getElementById('email-subject').value = '';
    document.getElementById('email-body').value = '';
    document.getElementById('phone-number').value = '';
    document.getElementById('sms-message').value = '';
    document.getElementById('qr-frame-text').value = '';
    updateQR();
    showToast('🗑️ All fields reset successfully');
}

function downloadQR(format) {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) return;

    const frameText = document.getElementById('qr-frame-text').value.trim();

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    const padding = 30;
    const bottomExtra = frameText ? 50 : 0;

    exportCanvas.width = canvas.width + (padding * 2);
    exportCanvas.height = canvas.height + (padding * 2) + bottomExtra;

    // Background
    ctx.fillStyle = document.getElementById('qr-color-bg').value;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw QR Code
    ctx.drawImage(canvas, padding, padding);

    // Draw Frame Text
    if (frameText) {
        ctx.fillStyle = document.getElementById('qr-color-fg').value;
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(frameText, exportCanvas.width / 2, exportCanvas.height - 20);
    }

    const link = document.createElement('a');
    link.download = `qrcode-studio-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('✅ High-Resolution QR PNG Downloaded');
}

async function copyQRImage() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) return;

    try {
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            const btnText = document.getElementById('copy-img-btn-text');
            btnText.textContent = '✓ Copied PNG!';
            showToast('📋 QR Code Image copied to clipboard');
            setTimeout(() => { btnText.textContent = 'Copy Image'; }, 2000);
        });
    } catch (err) {
        showToast('⚠️ Direct image copy not supported in this browser');
    }
}

function copyDataText() {
    if (!currentData) return;
    navigator.clipboard.writeText(currentData).then(() => {
        const btnText = document.getElementById('copy-raw-btn-text');
        btnText.textContent = '✓ Copied Text!';
        showToast('📋 Payload data copied to clipboard');
        setTimeout(() => { btnText.textContent = 'Copy Raw Data'; }, 2000);
    });
}

function showToast(msg, icon = '✨') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = msg;
    document.getElementById('toast-icon').textContent = icon;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ===== QR SCANNER LOGIC ===== */
function handleImageScan(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (window.jsQR) {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    displayScanResult(code.data);
                } else {
                    showToast('⚠️ No valid QR code detected in this image', '❌');
                }
            } else {
                showToast('Scanner library loading... please try again.', '⏳');
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

async function toggleCameraScanner() {
    if (isScanningCamera) {
        stopCameraScanner();
    } else {
        startCameraScanner();
    }
}

async function startCameraScanner() {
    const videoBox = document.getElementById('scanner-video-box');
    const video = document.getElementById('scanner-video');
    const btn = document.getElementById('btn-camera-toggle');

    try {
        scannerStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = scannerStream;
        video.setAttribute('playsinline', true);
        await video.play();

        videoBox.classList.remove('hidden');
        isScanningCamera = true;
        btn.textContent = '⏹ Stop Camera Scanner';
        btn.classList.replace('bg-purple-600', 'bg-rose-600');
        requestAnimationFrame(scanCameraTick);
        showToast('📷 Camera scanner activated', '📹');
    } catch (err) {
        showToast('⚠️ Camera access denied or unavailable', '🚫');
    }
}

function stopCameraScanner() {
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
    const videoBox = document.getElementById('scanner-video-box');
    const btn = document.getElementById('btn-camera-toggle');
    videoBox.classList.add('hidden');
    isScanningCamera = false;
    btn.textContent = '📹 Start Camera Scanner';
    btn.classList.replace('bg-rose-600', 'bg-purple-600');
}

function scanCameraTick() {
    if (!isScanningCamera) return;

    const video = document.getElementById('scanner-video');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.getElementById('scanner-canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
                displayScanResult(code.data);
                stopCameraScanner();
                return;
            }
        }
    }
    requestAnimationFrame(scanCameraTick);
}

function displayScanResult(data) {
    const card = document.getElementById('scan-result-card');
    const textElem = document.getElementById('scan-result-text');
    const openBtn = document.getElementById('scan-open-btn');

    textElem.textContent = data;
    card.classList.remove('hidden');

    if (data.startsWith('http://') || data.startsWith('https://')) {
        openBtn.classList.remove('hidden');
        openBtn.dataset.url = data;
    } else {
        openBtn.classList.add('hidden');
    }

    showToast('🎉 QR Code Decoded Successfully!', '✅');
}

function copyScannedText() {
    const text = document.getElementById('scan-result-text').textContent;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 Scanned content copied to clipboard');
        });
    }
}

function openScannedUrl() {
    const url = document.getElementById('scan-open-btn').dataset.url;
    if (url) window.open(url, '_blank');
}

// Initialize theme and default demo URL on load
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateQR();
});
