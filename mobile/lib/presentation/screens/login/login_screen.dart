import 'package:flutter/material.dart';
import 'package:mobile/core/routes/app_routes.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/data/storage/token_storage.dart';

// AppColors - định nghĩa màu sắc
class AppColors {
  static const fptOrange = Color(0xFFFF6B00);
  static const fptOrangeLight = Color(0xFFFF8534);
  static const fptOrangePastel = Color(0xFFFFE5D3);
  static const lightBackground = Color(0xFFFAFAFA);
  static const white = Color(0xFFFFFFFF);
  static const cream = Color(0xFFFFF8F0);
  static const lightGray = Color(0xFFF5F5F5);
  static const textPrimary = Color(0xFF2D2D2D);
  static const textSecondary = Color(0xFF757575);
  static const borderColor = Color(0xFFE0E0E0);
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();
  final _passCtl = TextEditingController();
  bool _obscure = true;
  bool _isSubmitting = false;

  String? _emailError;
  String? _passError;

  @override
  void dispose() {
    _emailCtl.dispose();
    _passCtl.dispose();
    super.dispose();
  }

  void _showBar(String msg, {IconData? icon, Color? color}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            if (icon != null) Icon(icon, color: Colors.white),
            if (icon != null) const SizedBox(width: 8),
            Expanded(child: Text(msg)),
          ],
        ),
        backgroundColor: color ?? AppColors.fptOrange,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return "Vui lòng nhập email";
    final ok = RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(v.trim());
    return ok ? null : "Email không hợp lệ";
  }

  String? _validatePassword(String? v) {
    if (v == null || v.isEmpty) return "Vui lòng nhập mật khẩu";
    if (v.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
    return null;
  }

  Future<void> _onLogin() async {
  print('📍 Step 1: _onLogin started');
  
  // Validate
  setState(() {
    _emailError = _validateEmail(_emailCtl.text);
    _passError = _validatePassword(_passCtl.text);
  });

  if (_emailError != null || _passError != null) {
    print('❌ Validation failed');
    return;
  }

  print('📍 Step 2: Validation passed');
  setState(() => _isSubmitting = true);

  try {
    print('📍 Step 3: Calling API...');
    
    final response = await AuthService.login(
      email: _emailCtl.text.trim(),
      password: _passCtl.text,
    );

    print('📍 Step 4: API response received');
    setState(() => _isSubmitting = false);

    if (response.isSuccess && response.data != null) {
      print('✅ Login successful!');
      
      // ==================== LƯU TOKEN ====================
      print('📍 Step 5: Saving login data...');
      await TokenStorage.saveLoginData(
        token: response.data!.token,
        role: response.data!.role,
        email: _emailCtl.text.trim(),
        firstLogin: response.data!.firstLogin,
        // refreshToken: response.data!.refreshToken, // Nếu có
      );
      print('✅ Login data saved!');
      
      // Print để kiểm tra
      await TokenStorage.printUserInfo();
      // ===================================================
      
      // Show success message
      _showBar(
        response.message,
        icon: Icons.check_circle,
        color: Colors.green,
      );
      
      print('📍 Step 6: Waiting 1 second...');
      await Future.delayed(const Duration(seconds: 1));
      
      print('📍 Step 7: Checking mounted...');
      if (!mounted) {
        print('❌ Widget not mounted');
        return;
      }
      print('✅ Widget mounted');

      print('📍 Step 8: Checking firstLogin...');
      if (response.data!.firstLogin) {
        print('➡️ First login - going to change password');
        Navigator.pushReplacementNamed(context, '/change-password');
      } else {
        print('➡️ Not first login - navigating by role');
        _navigateByRole(response.data!.role);
      }
      
    } else {
      print('❌ Login failed');
    }
  } catch (e) {
    print('❌ Error: $e');
    setState(() => _isSubmitting = false);

    _showBar(
      e.toString().replaceAll('Exception: ', ''),
      icon: Icons.error_outline,
      color: Colors.red,
    );
  }
}

void _navigateByRole(String role) {
  print('🔄 Navigating by role: $role');
  
  String message = '';
  
  switch (role) {
    case 'HEADOFDEPARTMENT':
      message = 'Chào mừng Trưởng khoa!';
      break;
    case 'LECTURER':
      message = 'Chào mừng Giảng viên!';
      break;
    case 'ADMIN':
      message = 'Chào mừng Admin!';
      break;
    default:
      message = 'Chào mừng!';
      break;
  }
  
  print('➡️ Going to home...');
  Navigator.pushReplacementNamed(context, AppRoutes.home);
  
  // Show welcome message sau khi navigate
  Future.delayed(const Duration(milliseconds: 500), () {
    if (mounted) {
      _showBar(message, icon: Icons.home, color: Colors.blue);
    }
  });
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      body: Container(
        width: double.infinity,
        height: MediaQuery.of(context).size.height,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.fptOrangePastel,
              AppColors.white,
              AppColors.cream,
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 40),

                    const SizedBox(height: 40),

                    // Title
                    const Text(
                      "Chào mừng trở lại!",
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Subtitle
                    const Text(
                      "FPT Graduation Thesis Management",
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 16,
                        fontWeight: FontWeight.w400,
                      ),
                    ),

                    const SizedBox(height: 48),

                    // Email Field
                    _buildTextField(
                      controller: _emailCtl,
                      hint: "Email",
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      error: _emailError,
                      onChanged: (v) {
                        if (_emailError != null) {
                          setState(() {
                            _emailError = _validateEmail(v);
                          });
                        }
                      },
                    ),

                    const SizedBox(height: 20),

                    // Password Field
                    _buildTextField(
                      controller: _passCtl,
                      hint: "Mật khẩu",
                      icon: Icons.lock_outline,
                      obscureText: _obscure,
                      error: _passError,
                      onChanged: (v) {
                        if (_passError != null) {
                          setState(() {
                            _passError = _validatePassword(v);
                          });
                        }
                      },
                      suffixIcon: IconButton(
                        onPressed: () => setState(() => _obscure = !_obscure),
                        icon: Icon(
                          _obscure
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Sign In Button
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _onLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.fptOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(28),
                          ),
                          elevation: 8,
                          shadowColor: AppColors.fptOrange.withOpacity(0.5),
                          disabledBackgroundColor: AppColors.fptOrange
                              .withOpacity(0.6),
                        ),
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                "Đăng nhập",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.5,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 48),

                    // Or Sign in with
                    Row(
                      children: [
                        Expanded(
                          child: Divider(
                            color: AppColors.borderColor,
                            thickness: 1,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            "Hoặc đăng nhập với",
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Divider(
                            color: AppColors.borderColor,
                            thickness: 1,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Social Login Buttons
                    Column(
                      children: [
                        _buildSocialButtonWithText(
                          onTap: () => _showBar("Tính năng đang phát triển"),
                          icon: Image.asset(
                            'assets/icons/google.png',
                            width: 24,
                            height: 24,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.g_mobiledata,
                              color: AppColors.fptOrange,
                              size: 28,
                            ),
                          ),
                          text: "Đăng nhập bằng Google",
                        ),
                      ],
                    ),

                    const SizedBox(height: 40),

                    // Sign Up Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Chưa có tài khoản? ",
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 15,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            // Navigator.pushNamed(context, '/register');
                            _showBar("Đi tới đăng ký", icon: Icons.person_add);
                          },
                          child: const Text(
                            "Đăng ký",
                            style: TextStyle(
                              color: AppColors.fptOrange,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 60),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? error,
    Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(
              color: error != null ? Colors.redAccent : AppColors.borderColor,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.fptOrange.withOpacity(0.08),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            onChanged: onChanged,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(
                color: AppColors.textSecondary.withOpacity(0.6),
                fontSize: 16,
              ),
              prefixIcon: Icon(icon, color: AppColors.fptOrange, size: 22),
              suffixIcon: suffixIcon,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 18,
              ),
            ),
          ),
        ),
        // Error message bên ngoài
        if (error != null)
          Padding(
            padding: const EdgeInsets.only(left: 20, top: 8),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  color: Colors.redAccent,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  error,
                  style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSocialButtonWithText({
    required VoidCallback onTap,
    required Widget icon,
    required String text,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.borderColor, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.fptOrange.withOpacity(0.1),
              blurRadius: 15,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              icon,
              const SizedBox(width: 12),
              Text(
                text,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
