import 'package:flutter/material.dart';
import 'package:mobile/screens/login_screen.dart';

const FPT_ORANGE = Color(0xFFFF6600);
const FPT_BG_SOFT = Color(0xFFFFF3E6);

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.fromSeed(seedColor: FPT_ORANGE);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: scheme.copyWith(primary: FPT_ORANGE),
        scaffoldBackgroundColor: FPT_BG_SOFT,
        appBarTheme: const AppBarTheme(
          backgroundColor: FPT_ORANGE,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: FPT_ORANGE,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: FPT_ORANGE, width: 1.4),
            borderRadius: BorderRadius.all(Radius.circular(10)),
          ),
          labelStyle: const TextStyle(color: Colors.black87),
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
