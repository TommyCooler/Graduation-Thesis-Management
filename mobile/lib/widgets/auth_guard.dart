import 'package:flutter/material.dart';
import 'package:mobile/core/routes/app_routes.dart';
import 'package:mobile/data/storage/token_storage.dart';

/// AuthGuard - Check login status khi app khởi động
///
/// Nếu đã login → Navigate to Home
/// Nếu chưa login → Ở lại Login
class AuthGuard extends StatefulWidget {
  const AuthGuard({Key? key}) : super(key: key);

  @override
  State<AuthGuard> createState() => _AuthGuardState();
}

class _AuthGuardState extends State<AuthGuard> {
  bool _isChecking = true;

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    print('🔐 Checking auth status...');

    try {
      // Check đã login chưa
      final isLoggedIn = await TokenStorage.isLoggedIn();

      if (isLoggedIn) {
        print('✅ User is logged in');

        // Check token còn hạn không
        final isValid = await TokenStorage.isTokenValid();

        if (isValid) {
          print('✅ Token is valid');

          // Get user info
          final userInfo = await TokenStorage.getUserInfo();
          print('👤 User role: ${userInfo['role']}');

          // Navigate to home
          if (mounted) {
            Navigator.pushReplacementNamed(context, AppRoutes.home);
          }
        } else {
          print('⚠️ Token expired - need to login again');
          await TokenStorage.clearAll();
          _showLoginScreen();
        }
      } else {
        print('❌ User not logged in');
        _showLoginScreen();
      }
    } catch (e) {
      print('❌ Error checking auth: $e');
      _showLoginScreen();
    }
  }

  void _showLoginScreen() {
    if (mounted) {
      setState(() {
        Navigator.pushReplacementNamed(context, AppRoutes.login);
        _isChecking = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isChecking) {
      // Show loading splash
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFFFF6B00)),
              SizedBox(height: 24),
              Text(
                'Đang kiểm tra...',
                style: TextStyle(fontSize: 16, color: Color(0xFF757575)),
              ),
            ],
          ),
        ),
      );
    }

    // Sẽ không bao giờ đến đây vì đã navigate rồi
    // Nhưng Flutter cần return widget
    return const SizedBox.shrink();
  }
}
