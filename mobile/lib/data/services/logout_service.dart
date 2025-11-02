import 'package:flutter/material.dart';
import 'package:mobile/core/routes/app_routes.dart';
import 'package:mobile/data/storage/token_storage.dart';

/// Logout Service
class LogoutService {
  /// Logout và xóa toàn bộ data
  static Future<void> logout(BuildContext context) async {
    try {
      print('🚪 Logging out...');
      
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );
      
      // Xóa token và user data
      await TokenStorage.clearAll();
      
      // Optional: Call backend logout API nếu có
      // await AuthService.logout();
      
      print('✅ Logout successful');
      
      // Close loading dialog
      Navigator.pop(context);
      
      // Navigate to login và xóa hết history
      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.login,
        (route) => false,
      );
      
    } catch (e) {
      print('❌ Logout error: $e');
      
      // Close loading dialog nếu còn
      Navigator.pop(context);
      
      // Show error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi đăng xuất: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  /// Show confirm dialog trước khi logout
  static Future<void> confirmLogout(BuildContext context) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc muốn đăng xuất?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );

    if (result == true) {
      await logout(context);
    }
  }
}