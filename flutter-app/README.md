# 📱 Ticket Scanner - Flutter App

Mobile application for scanning and verifying event tickets using QR codes.

**Platforms**: Android & iOS only (Web, Windows, macOS, Linux removed for mobile focus)

---

## 🎯 **Features**

- � **QR Code Scanning** - Fast and accurate ticket scanning
- ✅ **Real-time Verification** - Instant ticket validation via API
- 📊 **Scan History** - Track scanned tickets
- 🔒 **Admin Authentication** - Secure access control
- 📡 **Offline Mode** - Queue scans when offline (Phase 2)
- 🎨 **Beautiful UI** - Material Design 3 interface

---

## 🏗️ **Project Details**

- **App Name**: Ticket Scanner
- **Package Name**: `ticket_scanner`
- **Organization**: `com.eventticket`
- **Bundle ID**: `com.eventticket.ticket_scanner`

---

## 📦 **Dependencies**

```yaml
dependencies:
  mobile_scanner: ^5.2.3           # QR code scanning
  http: ^1.2.2                     # API communication
  provider: ^6.1.2                 # State management
  flutter_secure_storage: ^9.2.2   # Secure token storage
  flutter_spinkit: ^5.2.1          # Loading animations
```

---

## 🚀 **Setup**

### Prerequisites

- Flutter SDK 3.9.2 or higher
- Android Studio / Xcode (for mobile development)
- Backend API running at `http://localhost:8000`

### Installation

```bash
cd flutter-app

# Get dependencies
flutter pub get

# Check Flutter setup
flutter doctor
```

---

## ▶️ **Running the App**

### Android Emulator

```bash
flutter run
```

### Specific Device

```bash
# List connected devices
flutter devices

# Run on specific device
flutter run -d <device-id>
```

**Note**: Web and desktop platforms have been disabled. Use Android or iOS devices/emulators only.

---

## 🏗️ **Project Structure**

```
lib/
├── main.dart                      # App entry point
├── screens/
│   ├── login_screen.dart          # Admin login
│   ├── scanner_screen.dart        # QR scanning interface
│   ├── verify_screen.dart         # Verification result display
│   └── history_screen.dart        # Scan history
├── services/
│   ├── api_service.dart           # Backend API integration
│   ├── auth_service.dart          # Authentication handling
│   └── scanner_service.dart       # QR code processing
├── models/
│   ├── ticket.dart                # Ticket data model
│   └── scan_result.dart           # Scan result model
├── providers/
│   ├── auth_provider.dart         # Auth state management
│   └── scan_provider.dart         # Scan state management
└── widgets/
    ├── scan_button.dart           # Custom scan button
    └── result_card.dart           # Result display widget
```

---

## 🔌 **API Integration**

The app connects to the FastAPI backend:

### Base URL (Development)
```dart
const String API_BASE_URL = "http://localhost:8000";
```

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/admin/scan` | Log scan entry |
| `GET` | `/api/registration/check/{email}` | Verify ticket |
| `POST` | `/api/auth/login` | Admin authentication |

---

## 📱 **Permissions Required**

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

### iOS (`ios/Runner/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for scanning QR codes</string>
```

---

## 🧪 **Testing**

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage
```

---

## 📦 **Build for Production**

### Android APK

```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

---

## 🔧 **Configuration**

### API URL Configuration

Edit `lib/services/api_service.dart`:

```dart
// Development
static const String baseUrl = "http://10.0.2.2:8000"; // Android emulator
// or
static const String baseUrl = "http://localhost:8000"; // iOS simulator

// Production
static const String baseUrl = "https://your-api-domain.com";
```

---

## 🎨 **Customization**

### App Name

Edit in:
- `pubspec.yaml` - `name: ticket_scanner`
- `android/app/src/main/AndroidManifest.xml` - `android:label`
- `ios/Runner/Info.plist` - `CFBundleName`

### App Icon

Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

Or use [flutter_launcher_icons](https://pub.dev/packages/flutter_launcher_icons):

```bash
flutter pub add flutter_launcher_icons
flutter pub run flutter_launcher_icons
```

---

## 📝 **TODO**

- [ ] Implement QR scanner screen
- [ ] Add API service layer
- [ ] Create verification result UI
- [ ] Add admin authentication
- [ ] Implement offline mode with local queue
- [ ] Add scan history tracking
- [ ] Create statistics dashboard
- [ ] Add sound/vibration feedback on scan
- [ ] Implement dark mode support

---

## 🐛 **Troubleshooting**

### Camera not working?
```bash
# Check permissions in AndroidManifest.xml / Info.plist
# Enable camera in emulator settings
```

### API connection failed?
```bash
# For Android emulator, use 10.0.2.2 instead of localhost
# Check backend is running on port 8000
# Verify CORS settings in backend
```

### Build errors?
```bash
flutter clean
flutter pub get
flutter run
```

---

## 📄 **License**

MIT License - see LICENSE file for details

---

## 🙋 **Support**

For issues or questions:
1. Check backend API is running
2. Verify camera permissions are granted
3. Check API endpoint configuration
4. Review Flutter doctor output: `flutter doctor -v`

---

**Ready to scan tickets! 🎫✨**
