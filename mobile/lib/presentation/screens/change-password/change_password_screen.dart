import 'package:flutter/material.dart';
import 'package:mobile/data/services/account_service.dart';
import 'package:mobile/data/storage/token_storage.dart';
import 'package:mobile/core/routes/app_routes.dart';

class AppColors {
  static const fptOrange = Color(0xFFFF6B00);
  static const fptOrangeLight = Color(0xFFFF8534);
  static const fptOrangePastel = Color(0xFFFFE5D3);
  static const white = Color(0xFFFFFFFF);
  static const cream = Color(0xFFFFF8F0);
  static const borderColor = Color(0xFFE0E0E0);
  static const textPrimary = Color(0xFF2D2D2D);
  static const textSecondary = Color(0xFF757575);
}

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({Key? key}) : super(key: key);

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _newPassCtl = TextEditingController();
  final _confirmCtl = TextEditingController();
  bool _obscure1 = true;
  bool _obscure2 = true;
  bool _submitting = false;
  String? _email;

  @override
  void initState() {
    super.initState();
    _loadEmail();
  }

  Future<void> _loadEmail() async {
    final email = await TokenStorage.getEmail();
    setState(() => _email = email ?? '');
  }

  @override
  void dispose() {
    _newPassCtl.dispose();
    _confirmCtl.dispose();
    super.dispose();
  }

  void _showSnack(String msg, {Color? color, IconData? icon}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: color ?? AppColors.fptOrange,
        content: Row(
          children: [
            if (icon != null) Icon(icon, color: Colors.white),
            if (icon != null) const SizedBox(width: 8),
            Expanded(child: Text(msg)),
          ],
        ),
      ),
    );
  }

  String? _validatePassword(String? v) {
    if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu mới';
    if (v.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
    return null;
  }

  Future<void> _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_newPassCtl.text != _confirmCtl.text) {
      _showSnack('Mật khẩu xác nhận không khớp', color: Colors.red, icon: Icons.error_outline);
      return;
    }

    setState(() => _submitting = true);
    try {
      final msg = await AccountService.changeFirstLoginPassWord(
        newPassword: _newPassCtl.text,
      );

      // Xoá token/local info để buộc đăng nhập lại
      await TokenStorage.clearAll();

      if (!mounted) return;
      _showSnack(msg, color: Colors.green, icon: Icons.check_circle);

      // Chuyển về màn đăng nhập
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (_) => false);
    } catch (e) {
      _showSnack(e.toString().replaceAll('Exception: ', ''), color: Colors.red, icon: Icons.error_outline);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        backgroundColor: AppColors.fptOrange,
        title: const Text('Đổi mật khẩu', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.fptOrangePastel, AppColors.white, AppColors.cream],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 12),
                  const Text(
                    'Thiết lập mật khẩu mới',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Đây là lần đăng nhập đầu tiên. Vui lòng đặt mật khẩu mới để tiếp tục sử dụng hệ thống.',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 24),

                  // Email read-only
                  _readonlyField(
                    label: 'Email',
                    value: _email ?? '—',
                    icon: Icons.email_outlined,
                  ),
                  const SizedBox(height: 16),

                  // New password
                  _inputField(
                    label: 'Mật khẩu mới',
                    controller: _newPassCtl,
                    obscure: _obscure1,
                    toggle: () => setState(() => _obscure1 = !_obscure1),
                    validator: _validatePassword,
                    icon: Icons.lock_outline,
                  ),
                  const SizedBox(height: 16),

                  // Confirm password
                  _inputField(
                    label: 'Xác nhận mật khẩu',
                    controller: _confirmCtl,
                    obscure: _obscure2,
                    toggle: () => setState(() => _obscure2 = !_obscure2),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Vui lòng xác nhận mật khẩu';
                      if (v != _newPassCtl.text) return 'Mật khẩu xác nhận không khớp';
                      return null;
                    },
                    icon: Icons.lock_reset_outlined,
                  ),

                  const SizedBox(height: 28),
                  SizedBox(
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _submitting ? null : _onSubmit,
                      icon: _submitting
                          ? const SizedBox(
                              width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.check),
                      label: Text(
                        _submitting ? 'Đang xử lý...' : 'Xác nhận',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.fptOrange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                        elevation: 8,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _readonlyField({required String label, required String value, required IconData icon}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderColor, width: 1.2),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppColors.fptOrange),
        title: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        subtitle: Text(value, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      ),
    );
  }

  Widget _inputField({
    required String label,
    required TextEditingController controller,
    required bool obscure,
    required VoidCallback toggle,
    required String? Function(String?) validator,
    required IconData icon,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderColor, width: 1.2),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          prefixIcon: Icon(icon, color: AppColors.fptOrange),
          suffixIcon: IconButton(
            onPressed: toggle,
            icon: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                color: AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}
