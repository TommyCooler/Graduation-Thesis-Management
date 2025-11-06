import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/routes/app_routes.dart';
import 'package:mobile/presentation/screens/login/login_screen.dart';
import 'package:mobile/widgets/auth_guard.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'FPT Graduation Thesis Management',
      theme: ThemeData(
        primaryColor: const Color(0xFFFF6B00),
        scaffoldBackgroundColor: const Color(0xFF1a0f1f),
        useMaterial3: true,
      ),
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,

      // Routes
      home: const AuthGuard(),
      routes: AppRoutes.routes,
      onGenerateRoute: AppRoutes.onGenerateRoute,

    );
  }
}
