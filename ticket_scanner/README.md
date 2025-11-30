# 🎫 Event Ticket Scanner (Flutter App)

**Cross-platform mobile app** for QR code scanning, ticket verification, and real-time check-in management.

![Flutter](https://img.shields.io/badge/Flutter-3.x-blue)
![Version](https://img.shields.io/badge/version-1.2.0%2B2-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the App](#-running-the-app)
- [Building APK](#-building-apk)
- [App Icon Generation](#-app-icon-generation)
- [Backend Integration](#-backend-integration)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🔍 QR Code Scanning
- Real-time QR code detection using camera
- Automatic ticket verification
- Haptic feedback on successful scan
- Error handling for invalid tickets

### 🔐 Admin Authentication
- Secure login with JWT tokens
- Persistent authentication (flutter_secure_storage)
- Auto-logout on invalid credentials
- Session management

### ✅ Ticket Verification
- Check ticket validity before marking as used
- Prevent duplicate check-ins
- Display ticket details (name, serial)
- Success/error notifications

### 📱 User Interface
- Clean material design
- Loading states for async operations
- Error dialogs with clear messages
- Responsive layout

---

## 🛠️ Tech Stack

| Component | Package | Version |
|-----------|---------|---------|
| **Framework** | Flutter SDK | 3.x |
| **QR Scanner** | mobile_scanner | 5.2.3 |
| **Secure Storage** | flutter_secure_storage | 9.2.2 |
| **HTTP Client** | http | 1.2.2 |
| **Icons** | flutter_launcher_icons | 0.14.1 |

---

## 📦 Prerequisites

### Required Software
- **Flutter SDK** 3.0.0 or higher
- **Dart SDK** 3.0.0 or higher (bundled with Flutter)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Git**

### System Requirements
- **Windows:** 10 or later (64-bit), x86-64
- **macOS:** 10.15 or later (Intel or Apple Silicon)
- **Linux:** 64-bit
- **Disk Space:** 2.8 GB (not including IDE/tools)

### Install Flutter

**Windows:**
```powershell
# Download Flutter SDK from https://docs.flutter.dev/get-started/install/windows
# Extract to C:\src\flutter
# Add to PATH: C:\src\flutter\bin

# Verify installation
flutter doctor
```

**macOS/Linux:**
```bash
# Download and extract Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Verify installation
flutter doctor
```

---

## 💻 Installation

### 1. Clone Repository

```bash
git clone https://github.com/FALLEN-01/Event-Ticketing-System.git
cd Event-Ticketing-System/ticket_scanner
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Verify Setup

```bash
flutter doctor -v
```

Ensure these are checked:
- ✅ Flutter SDK
- ✅ Android toolchain (Android Studio, SDK, licenses)
- ✅ Connected device or emulator

### 4. Accept Android Licenses

```bash
flutter doctor --android-licenses
```

---

## 🔧 Configuration

### Backend URL

Edit `lib/main.dart` to configure your backend URL:

```dart
// Production backend (Render)
final apiBaseUrl = 'https://event-ticketing-system-devx.onrender.com';

// Local development
// final apiBaseUrl = 'http://10.0.2.2:8000';  // Android Emulator
// final apiBaseUrl = 'http://localhost:8000';  // iOS Simulator
```

**Network Configuration:**
- **Android Emulator:** Use `10.0.2.2` for localhost
- **iOS Simulator:** Use `localhost`
- **Physical Device:** Use your computer's IP address (e.g., `http://192.168.1.100:8000`)

### Permissions

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

Already configured in the project.

---

## 🏃 Running the App

### Development Mode

**Connect Device or Start Emulator:**
```bash
# List available devices
flutter devices

# Start Android Emulator
flutter emulators --launch <emulator_id>
```

**Run App:**
```bash
# Run on default device
flutter run

# Run on specific device
flutter run -d <device_id>

# Run with hot reload enabled (default)
flutter run --hot
```

### Testing

**Run Unit Tests:**
```bash
flutter test
```

**Run Integration Tests:**
```bash
flutter test integration_test/
```

---

## 📦 Building APK

### Debug APK (Development)

```bash
flutter build apk --debug
# Output: build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK (Production)

```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Split APKs (Smaller File Size)

```bash
flutter build apk --split-per-abi
# Outputs:
# - app-armeabi-v7a-release.apk (32-bit ARM)
# - app-arm64-v8a-release.apk (64-bit ARM)
# - app-x86_64-release.apk (64-bit Intel)
```

### Install on Device

```bash
# Install release APK
flutter install

# Or manually transfer APK
adb install build/app/outputs/flutter-apk/app-release.apk
```

### App Bundle (Google Play)

```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

---

## 🎨 App Icon Generation

### Custom Icon Setup

**1. Prepare Icon Image**
- Size: 512x512 pixels minimum
- Format: PNG with transparency
- Location: `assets/icon.png`

**2. Configure `pubspec.yaml`**

Already configured:
```yaml
flutter_launcher_icons:
  android: "launcher_icon"
  image_path: "assets/icon.png"
  adaptive_icon_background: "#4f46e5"  # Indigo-600
  adaptive_icon_foreground: "assets/icon.png"
```

**3. Generate Icons**

```bash
flutter pub run flutter_launcher_icons
```

**4. Verify Generated Icons**

Check `android/app/src/main/res/mipmap-*/`:
- `ic_launcher.png` (standard icons)
- `ic_launcher_foreground.png` (adaptive foreground)
- `ic_launcher_background.png` (adaptive background)

**5. Test on Device**

```bash
flutter run --release
# Check app icon in launcher
```

### Current Icon Design
- **Background:** Indigo (#4f46e5)
- **Design:** White ticket illustration with perforated edges
- **Style:** Material Design 3 compatible

---

## 🔗 Backend Integration

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/login` | POST | Admin authentication |
| `/verify-ticket/{serial}` | GET | Check ticket validity |
| `/mark-used/{serial}` | POST | Mark ticket as checked-in |

### Authentication Flow

1. **Login Screen:**
   ```dart
   POST /api/admin/login
   Body: {"email": "admin@gmail.com", "password": "admin123"}
   Response: {"access_token": "jwt-token"}
   ```

2. **Store Token:**
   ```dart
   await storage.write(key: 'jwt_token', value: token);
   ```

3. **Verify Ticket:**
   ```dart
   GET /verify-ticket/{serial}
   Headers: {"Authorization": "Bearer {token}"}
   Response: {"valid": true, "ticket": {...}}
   ```

4. **Check-In:**
   ```dart
   POST /mark-used/{serial}
   Headers: {"Authorization": "Bearer {token}"}
   Response: {"success": true, "message": "Checked in"}
   ```

### Default Admin Credentials

- **Email:** admin@gmail.com
- **Password:** admin123
- ⚠️ **Change immediately after first deployment!**

---

## 🐛 Troubleshooting

### Common Issues

**1. Camera Not Working**
```bash
# Check permissions in AndroidManifest.xml
# Test on physical device (emulator cameras are unreliable)
# Verify mobile_scanner package version
flutter pub get
```

**2. Backend Connection Failed**
```bash
# Check backend URL in lib/main.dart
# For Android Emulator, use 10.0.2.2 instead of localhost
# For physical device, use computer's IP address
# Ensure backend is running: curl http://localhost:8000/health
```

**3. Build Failures**
```bash
# Clean build cache
flutter clean

# Get dependencies
flutter pub get

# Rebuild
flutter build apk --release
```

**4. JWT Authentication Failed**
```bash
# Check backend JWT_SECRET_KEY in .env
# Verify token storage:
await storage.read(key: 'jwt_token');

# Clear stored token and re-login
await storage.delete(key: 'jwt_token');
```

**5. App Icon Not Showing**
```bash
# Regenerate icons
flutter pub run flutter_launcher_icons

# Clean and rebuild
flutter clean
flutter build apk --release

# Uninstall old app before installing new one
adb uninstall com.example.ticket_scanner
flutter install
```

### Debug Mode

```bash
# Run with verbose logging
flutter run -v

# Check device logs
flutter logs

# Android-specific logs
adb logcat | grep Flutter
```

### Performance Issues

```bash
# Build with profile mode
flutter run --profile

# Analyze performance
flutter analyze
```

---

## 📚 Dependencies

### Core Packages

**`mobile_scanner: ^5.2.3`**
- QR code scanning with camera
- Android and iOS support
- Hardware acceleration
- Documentation: https://pub.dev/packages/mobile_scanner

**`flutter_secure_storage: ^9.2.2`**
- Secure key-value storage
- Keychain (iOS) / Keystore (Android)
- JWT token persistence
- Documentation: https://pub.dev/packages/flutter_secure_storage

**`http: ^1.2.2`**
- HTTP client for API requests
- JSON encoding/decoding
- Async/await support
- Documentation: https://pub.dev/packages/http

### Dev Dependencies

**`flutter_launcher_icons: ^0.14.1`**
- Automatic icon generation
- Adaptive icons for Android
- Multiple resolutions
- Documentation: https://pub.dev/packages/flutter_launcher_icons

---

## 🔄 Workflow

### User Flow

```
1. Open App
   ↓
2. Login Screen
   ↓ (Enter admin credentials)
3. Scanner Screen
   ↓ (Scan QR code)
4. Verify Ticket
   ↓ (Backend validation)
5. Mark as Used
   ↓ (Update attendance)
6. Success Confirmation
```

### Error Handling

- **Invalid QR Code:** Display error dialog
- **Already Used Ticket:** Show "Already checked in" message
- **Network Error:** Display retry option
- **Unauthorized:** Redirect to login screen

---

## 📱 Supported Platforms

| Platform | Minimum Version | Status |
|----------|----------------|--------|
| Android | 21 (Lollipop 5.0) | ✅ Fully Supported |
| iOS | 12.0 | ✅ Fully Supported |
| Web | - | ❌ Not Supported (camera access) |
| Windows | - | ❌ Not Supported |
| macOS | - | ❌ Not Supported |
| Linux | - | ❌ Not Supported |

---

## 🚀 Deployment Checklist

- [ ] Update `apiBaseUrl` to production URL
- [ ] Change default admin password
- [ ] Build release APK: `flutter build apk --release`
- [ ] Test on physical device
- [ ] Verify QR scanning functionality
- [ ] Test network connectivity
- [ ] Check camera permissions
- [ ] Validate authentication flow
- [ ] Test error handling
- [ ] Distribute APK or publish to Google Play

---

## 📄 License

**MIT License with AI Training Prohibition** - Open source for human developers, closed to AI training systems.

See [LICENSE](../LICENSE) file for complete terms.

---

**Ticket Scanner v1.2.0+2** | Flutter App | Last Updated: November 30, 2025

For backend API documentation, see [Backend README](../backend/README.md).
For full project documentation, see [Root README](../README.md).
