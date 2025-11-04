# Flutter QR Scanner App - Event Ticketing System# ticket_scanner



Mobile application for scanning and verifying event tickets via QR codes.A new Flutter project.



## 🚀 Features## Getting Started



- **QR Code Scanner**: Centered square scanner with camera previewThis project is a starting point for a Flutter application.

- **Ticket Verification**: Real-time ticket validation against backend API

- **Manual Entry**: Fallback option to enter serial numbers manuallyA few resources to get you started if this is your first Flutter project:

- **Flash Toggle**: Built-in flashlight control for low-light scanning

- **Offline Support**: Graceful handling of network issues- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)

- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

## 📋 Tech Stack

For help getting started with Flutter development, view the

- **Framework**: Flutter SDK[online documentation](https://docs.flutter.dev/), which offers tutorials,

- **Scanner**: mobile_scanner ^5.2.3samples, guidance on mobile development, and a full API reference.

- **HTTP**: http ^1.2.2
- **Platform**: Android (tested on RMX3081)

## 🛠️ Installation

### Prerequisites
- Flutter SDK (latest stable)
- Android Studio / VS Code
- Android device or emulator

### Setup

1. **Install Flutter dependencies**:
```bash
cd ticket_scanner
flutter pub get
```

2. **Update API endpoint**:
Edit `lib/main.dart` and replace the API URL:
```dart
// For local development
final apiUrl = 'http://10.0.2.2:8000'; // Android emulator

// For production
final apiUrl = 'https://event-ticketing-system-devx.onrender.com';
```

3. **Run on device**:
```bash
# Connect Android device via USB
flutter run

# Or specify device
flutter devices
flutter run -d <device-id>
```

## 📱 UI Design

### Scanner Interface
- **Centered Square**: 300x300px scanning area
- **Black Background**: Better visibility
- **White Border**: Clear scanning zone indicator
- **Instruction Text**: "Scan QR Code" above scanner
- **Control Buttons**: Manual entry and flash toggle at bottom

### No Debug Banner
```dart
debugShowCheckedModeBanner: false
```

## 🔌 API Integration

### Ticket Verification Endpoint
```
POST /verify-ticket/{serial_number}
```

**Response**:
```json
{
  "valid": true,
  "message": "Ticket is valid",
  "registration": {
    "name": "John Doe",
    "email": "john@example.com",
    "is_used": false
  }
}
```

## 📝 Project Structure

```
ticket_scanner/
├── lib/
│   └── main.dart           # Main app file with scanner UI
├── android/
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── kotlin/
│   └── build.gradle.kts
├── pubspec.yaml            # Dependencies
├── analysis_options.yaml   # Linter configuration
└── README.md               # This file
```

## 🔧 Configuration

### Android Permissions
Already configured in `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-feature android:name="android.hardware.camera"/>
```

### Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  mobile_scanner: ^5.2.3
  http: ^1.2.2
```

## 🚢 Building for Release

### Android APK
```bash
flutter build apk --release
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

## 📱 Tested Devices

- ✅ Realme RMX3081 (Physical device)
- ✅ Android Emulator

## 🐛 Troubleshooting

### Camera Permission Denied
- Go to Settings → Apps → Your App → Permissions → Enable Camera

### Network Issues
- For emulator: Use `10.0.2.2` instead of `localhost`
- For physical device: Ensure device and PC are on same network
- For production: Use deployed backend URL

### Scanner Not Detecting QR
- Ensure good lighting
- Use flash toggle if needed
- Try manual entry as fallback

## 📄 License

See main repository LICENSE file.

## 🔗 Related

- [Backend API](../backend/)
- [Frontend Registration Form](../frontend/registration-form/)
- [Admin Dashboard](../frontend/admin-dashboard/)
