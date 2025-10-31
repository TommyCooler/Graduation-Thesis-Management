import 'package:flutter/material.dart';
import 'package:another_flushbar/flushbar.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/core/routes/app_routes.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();
  final _passCtl = TextEditingController();
  bool _obscure = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailCtl.dispose();
    _passCtl.dispose();
    super.dispose();
  }

  void _showBar(String msg, {Color color = AppColors.fptOrange, IconData icon = Icons.info}) {
    Flushbar(
      message: msg,
      icon: Icon(icon, color: Colors.white),
      duration: const Duration(seconds: 3),
      backgroundColor: color,
      borderRadius: BorderRadius.circular(12),
      margin: const EdgeInsets.all(16),
      flushbarPosition: FlushbarPosition.TOP,
    ).show(context);
  }

  Future<void> _onLogin() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    _showBar(
      "Đang xử lý đăng nhập...",
      icon: Icons.login,
      color: Colors.blueGrey,
    );

    // TODO: call API đăng nhập ở đây
    await Future.delayed(const Duration(seconds: 1)); // giả lập gọi API

    if (!mounted) return;
    
    setState(() => _isSubmitting = false);
    _showBar(
      "Đăng nhập thành công!",
      color: AppColors.success,
      icon: Icons.check_circle,
    );
    
    // Navigate to home screen
    // Sử dụng pushReplacementNamed để không thể back về login screen
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, AppRoutes.home);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Đăng nhập"),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo/Icon
                    const Icon(
                      Icons.lock_outline,
                      size: 56,
                      color: AppColors.fptOrange,
                    ),
                    const SizedBox(height: 16),
                    
                    // Title
                    Text(
                      "Chào mừng trở lại",
                      style: Theme.of(context).textTheme.headlineLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Hệ thống quản lý đồ án FPT",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                          ),
                    ),
                    const SizedBox(height: 32),

                    // Email Field
                    TextFormField(
                      controller: _emailCtl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: "Email",
                        hintText: "example@fpt.edu.vn",
                        prefixIcon: Icon(Icons.alternate_email),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return "Vui lòng nhập email";
                        }
                        final email = v.trim();
                        final ok = RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);
                        return ok ? null : "Email không hợp lệ";
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password Field
                    TextFormField(
                      controller: _passCtl,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        labelText: "Mật khẩu",
                        hintText: "Nhập mật khẩu của bạn",
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscure = !_obscure),
                          icon: Icon(
                            _obscure ? Icons.visibility_off : Icons.visibility,
                          ),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) {
                          return "Vui lòng nhập mật khẩu";
                        }
                        if (v.length < 6) {
                          return "Mật khẩu tối thiểu 6 ký tự";
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),

                    // Forgot Password
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {
                            _showBar(
                              "Đi tới đặt lại mật khẩu",
                              icon: Icons.key,
                              color: AppColors.info,
                            );
                            // Navigator.pushNamed(context, AppRoutes.forgotPassword);
                          },
                          child: const Text("Quên mật khẩu?"),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Login Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _onLogin,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text("Đăng nhập"),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Register Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Chưa có tài khoản? "),
                        TextButton(
                          onPressed: () {
                            _showBar(
                              "Đi tới đăng ký",
                              icon: Icons.person_add,
                              color: AppColors.info,
                            );
                            // Navigator.pushNamed(context, AppRoutes.register);
                          },
                          child: const Text("Tạo tài khoản"),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
