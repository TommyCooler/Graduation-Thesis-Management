# mobile

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.


# Mobile App Structure

## 📁 Cấu trúc thư mục

```
lib/
├── main.dart                      # Entry point của ứng dụng
├── app.dart                       # App widget chính
├── core/                          # Core functionality
│   ├── constants/                 # Constants
│   │   ├── app_constants.dart    # App-wide constants
│   │   └── app_colors.dart       # Color constants
│   ├── theme/                     # Theme configuration
│   │   └── app_theme.dart        # App theme
│   ├── routes/                    # Navigation
│   │   └── app_routes.dart       # Route configuration
│   └── utils/                     # Utilities
│       ├── validators.dart       # Form validators
│       ├── date_time_utils.dart  # Date/time utilities
│       └── extensions.dart       # Dart extensions
├── data/                          # Data layer
│   ├── models/                    # Data models
│   │   ├── user.dart             # User model
│   │   ├── topic.dart            # Topic model
│   │   └── api_response.dart    # API response wrapper
│   ├── services/                  # API services
│   │   └── (coming soon)
│   └── repositories/              # Repositories
│       └── (coming soon)
├── presentation/                  # Presentation layer
│   ├── screens/                   # App screens
│   │   ├── login/                # Login feature
│   │   │   └── login_screen.dart
│   │   └── home/                 # Home feature
│   │       └── home_screen.dart
│   ├── widgets/                   # Reusable widgets
│   │   └── (coming soon)
│   └── state_management/          # State management
│       └── (coming soon)
└── config/                        # Configuration
    ├── env/                       # Environment config
    │   └── (coming soon)
    └── injection.dart             # Dependency injection
        └── (coming soon)
```

## 📝 Thư mục và vai trò

| Thư mục | Vai trò |
|---------|---------|
| `core/` | Các thành phần cốt lõi dùng chung (theme, constants, helper functions, route config) |
| `data/` | Quản lý dữ liệu: API, models, local DB, repositories |
| `presentation/` | Phần giao diện: UI screens, widgets, state management |
| `config/` | Cấu hình môi trường, dependency injection |
| `main.dart` | Entry point của ứng dụng |
| `app.dart` | Root widget, cấu hình theme, routes |

## Theme & Colors

- **Primary Color**: FPT Orange (`#FF6600`)
- **Background**: Soft background (`#FFF3E6`)
- **Material 3**: Enabled
- **Custom Theme**: `core/theme/app_theme.dart`

## Getting Started

### Prerequisites
- Flutter SDK: 3.x+
- Dart SDK: 3.x+

### Run the app
```bash
flutter pub get
flutter run
```

## Dependencies

### Current Dependencies
- `flutter`: SDK
- `another_flushbar`: For showing toast messages

### Recommended Dependencies (to add)
```yaml
dependencies:
  # State Management
  flutter_bloc: ^8.1.3
  # or provider: ^6.0.5
  # or riverpod: ^2.4.0

  # Network
  dio: ^5.3.3
  http: ^1.1.0

  # Local Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # Utils
  intl: ^0.18.1
  logger: ^2.0.2+1
  
  # Dependency Injection
  get_it: ^7.6.4
  injectable: ^2.3.2
```

## Architecture

Dự án sử dụng **Clean Architecture** với các layer:

1. **Presentation Layer** (`presentation/`)
   - Screens
   - Widgets
   - State Management (Bloc/Provider/Riverpod)

2. **Data Layer** (`data/`)
   - Models
   - Services (API calls)
   - Repositories (Data sources)

3. **Core Layer** (`core/`)
   - Constants
   - Utils
   - Theme
   - Routes

## Screens

### Implemented
- Login Screen
- Home Screen

### To be implemented
- Register Screen
- Forgot Password Screen
- Profile Screen
- Topics List Screen
- Topic Detail Screen
- Create Topic Screen

## Authentication Flow

```
LoginScreen
    ↓
  API Call
    ↓
Store Token (SharedPreferences)
    ↓
Navigate to HomeScreen
```

## Development Guide

### Adding a new screen
1. Create folder in `presentation/screens/`
2. Create screen file with `_screen.dart` suffix
3. Add route in `core/routes/app_routes.dart`

### Adding a new model
1. Create file in `data/models/`
2. Implement `fromJson()` and `toJson()` methods
3. Add `copyWith()` method for immutability

### Adding a new service
1. Create file in `data/services/`
2. Define API endpoints
3. Implement CRUD operations
4. Handle errors properly

