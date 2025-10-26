import 'package:flutter/material.dart';
import 'package:another_flushbar/flushbar.dart';

const FPT_ORANGE = Color(0xFFFF6600);

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtl = TextEditingController();
  final _passCtl  = TextEditingController();
  bool _obscure = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailCtl.dispose();
    _passCtl.dispose();
    super.dispose();
  }

  void _showBar(String msg, {Color color = FPT_ORANGE, IconData icon = Icons.info}) {
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
    _showBar("Đang xử lý đăng nhập...", icon: Icons.login ,color: Colors.blueGrey);

    // TODO: call API đăng nhập ở đây
    await Future.delayed(const Duration(seconds: 1)); // giả lập gọi API

    setState(() => _isSubmitting = false);
    _showBar("Đăng nhập thành công!", color: Colors.green, icon: Icons.check_circle);
    // TODO: Navigator.pushReplacementNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Đăng nhập")),
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
                    const Icon(Icons.lock_outline, size: 56, color: FPT_ORANGE),
                    const SizedBox(height: 16),
                    const Text(
                      "Chào mừng trở lại",
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                    ),
                    const Text(
                      "Hệ thống quản lý đồ án FPT",
                      style: TextStyle(fontSize: 14, color: Colors.black54),
                    ),
                    const SizedBox(height: 24),

                    // Email
                    TextFormField(
                      controller: _emailCtl,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: "Email",
                        prefixIcon: Icon(Icons.alternate_email),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return "Vui lòng nhập email";
                        final email = v.trim();
                        final ok = RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);
                        return ok ? null : "Email không hợp lệ";
                      },
                    ),
                    const SizedBox(height: 14),

                    // Password
                    TextFormField(
                      controller: _passCtl,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        labelText: "Mật khẩu",
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscure = !_obscure),
                          icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return "Vui lòng nhập mật khẩu";
                        if (v.length < 6) return "Tối thiểu 6 ký tự";
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),

                    // Hàng phụ: quên mật khẩu
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {
                            _showBar("Đi tới đặt lại mật khẩu", icon: Icons.key, color: Colors.blueGrey);
                            // TODO: Navigator.pushNamed(context, '/forgot-password');
                          },
                          child: const Text("Quên mật khẩu?"),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Nút đăng nhập
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _onLogin,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 22, height: 22,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text("Đăng nhập", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Đăng ký (tuỳ chọn)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Chưa có tài khoản? "),
                        TextButton(
                          onPressed: () {
                            _showBar("Đi tới đăng ký", icon: Icons.person_add, color: Colors.blueGrey);
                            // TODO: Navigator.pushNamed(context, '/signup');
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
