import 'package:flutter/material.dart';
import 'package:mobile/data/models/account.dart';
import 'package:mobile/data/services/account_service.dart';
import 'package:mobile/data/storage/token_storage.dart';

// Tái sử dụng AppColors từ file Login
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

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({Key? key}) : super(key: key);

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  late Future<Account> _future;

  @override
  void initState() {
    super.initState();
    _future = AccountService.getCurrentAccount();
  }

  Future<void> _refresh() async {
    setState(() => _future = AccountService.getCurrentAccount());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.home),
            tooltip: 'Trang chủ',
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/home');
            },
          ),  
        ],
        backgroundColor: AppColors.fptOrange,
        title: const Text(
          'User Profile',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.fptOrangePastel,
              AppColors.white,
              AppColors.cream,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: _refresh,
            child: FutureBuilder<Account>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return _ErrorView(
                    message: snapshot.error.toString().replaceAll(
                      'Exception: ',
                      '',
                    ),
                    onRetry: _refresh,
                  );
                }
                final acc = snapshot.data!;
                return ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    const SizedBox(height: 8),
                    _avatar(acc.name),
                    const SizedBox(height: 16),
                    Center(
                      child: Text(
                        acc.name,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _infoCard(
                      children: [
                        _tile(
                          label: 'Name',
                          value: acc.name,
                          icon: Icons.person_outline,
                        ),
                        _tile(
                          label: 'Email',
                          value: acc.email,
                          icon: Icons.email_outlined,
                        ),
                        _tile(
                          label: 'Phone',
                          value: acc.phoneNumber?.isNotEmpty == true
                              ? acc.phoneNumber!
                              : '—',
                          icon: Icons.phone_outlined,
                        ),
                        _tile(
                          label: 'Role',
                          value: acc.role,
                          icon: Icons.verified_user_outlined,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.fptOrange,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 6,
                        shadowColor: AppColors.fptOrange.withOpacity(0.4),
                      ),
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh),
                      label: const Text(
                        'Làm mới thông tin',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _infoCard({required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderColor, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: AppColors.fptOrange.withOpacity(0.08),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _tile({
    required String label,
    required String value,
    required IconData icon,
    bool valueChip = false,
  }) {
    return ListTile(
      leading: CircleAvatar(
        radius: 18,
        backgroundColor: AppColors.fptOrangePastel,
        child: Icon(icon, color: AppColors.fptOrange),
      ),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: valueChip
          ? Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.fptOrangePastel,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.fptOrange,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
            )
          : Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
    );
  }

  Widget _avatar(String name) {
    final initials = name.trim().isEmpty
        ? '?'
        : name
              .trim()
              .split(RegExp(r'\s+'))
              .map((e) => e[0])
              .take(2)
              .join()
              .toUpperCase();
    return Center(
      child: Container(
        width: 96,
        height: 96,
        decoration: BoxDecoration(
          color: AppColors.fptOrangePastel,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.fptOrange.withOpacity(0.15),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Text(
          initials,
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppColors.fptOrange,
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry, Key? key})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 48),
        Icon(Icons.error_outline, color: Colors.red.shade400, size: 64),
        const SizedBox(height: 12),
        Text(
          'Không thể tải thông tin',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            color: Colors.red.shade400,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        Center(
          child: OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Thử lại'),
          ),
        ),
      ],
    );
  }
}
