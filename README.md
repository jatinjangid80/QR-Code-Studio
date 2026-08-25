# ⚡ QR Code Studio Pro

> A modern, high-resolution QR Code generator and live camera/image scanner built with HTML5, CSS3, and JavaScript. 100% client-side, private, and responsive across all devices.

![QR Code Studio Pro](logo.png)

## ✨ Features

- 🔗 **Multi-Format Generation**:
  - **Website URL**: Standard & secure web links.
  - **WiFi Network**: Instant connection with SSID, password, and encryption protocol (WPA/WPA2/WPA3, WEP, Open).
  - **vCard 3.0**: Digital business cards (Name, Phone, Email, Company, Job Title, Portfolio).
  - **UPI Payments**: Real-time Payee, VPA ID, INR Amount, and Transaction Notes.
  - **Plain Text**: Universal text payloads with character count and unicode support.
  - **Pre-composed Email**: Recipient, subject, and body auto-fill.
  - **Direct Phone & SMS**: Instant dialer and pre-filled text messages.
- 📷 **Integrated QR Scanner**:
  - Image file upload decoding (PNG, JPG, WEBP).
  - Live webcam and mobile back-camera scanner with auto-focus overlay.
- 🎨 **Design & Customization**:
  - Foreground & Background custom color pickers with luxury palette swatches.
  - Center Badges (Jatin Jangid Logo, Star, Lock, Verified Check, Smart Hub).
  - Canvas resolutions from 256px to 512px Ultra-HD.
  - Error correction levels (L 7%, M 15%, Q 25%, H 30%).
  - Branded Bottom Frame labels.
- 🌓 **Dark & Light Mode**:
  - Frosted glassmorphism navbar and luxury aurora ambient mesh background.
  - Persistent theme preference saved in `localStorage`.
- 💾 **Export & Clipboard**:
  - Download high-res branded PNG with frames.
  - Copy QR image directly to clipboard (`navigator.clipboard.write`).
  - Copy raw payload data.
- 🛡️ **100% Private & Offline**:
  - Zero data sent to any backend; everything runs purely in your browser.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/jatinjangid80/QR-Code-Studio.git
cd QR-Code-Studio
```

### 2. Open locally
Simply double-click `index.html` or run a local HTTP server:
```bash
# Python 3
python3 -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080).

---

## 📁 Project Structure

```
QR-Code-Studio/
├── index.html        # Main application structure & semantic layout
├── style.css         # Custom tokens, luxury mesh aurora background & responsive CSS
├── script.js         # Core QR engine, theme switcher, canvas export & camera scanner
├── logo.png          # Official brand logo & favicon
└── README.md         # Documentation & guide
```

---

## 👨‍💻 Author

**Designed & Deployed with ❤️ by Jatin Jangid**
- GitHub: [@jatinjangid80](https://github.com/jatinjangid80)
- Repository: [QR-Code-Studio](https://github.com/jatinjangid80/QR-Code-Studio)

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
