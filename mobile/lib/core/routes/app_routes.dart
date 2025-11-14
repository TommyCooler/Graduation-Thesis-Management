import 'package:flutter/material.dart';
import 'package:mobile/presentation/screens/change-password/change_password_screen.dart';
import 'package:mobile/presentation/screens/login/login_screen.dart';
import 'package:mobile/presentation/screens/home/home_screen.dart';
import 'package:mobile/presentation/screens/profile/user_profile_screen.dart';
import 'package:mobile/presentation/screens/review-council/review_council_screen.dart';
import 'package:mobile/presentation/screens/capstone-grading/capstone_grading_screen.dart';

/// App Routes
class AppRoutes {
  // Route Names
  static const String login = '/login';
  static const String home = '/home';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String profile = '/profile';
  static const String topics = '/topics';
  static const String topicDetail = '/topic-detail';
  static const String createTopic = '/create-topic';
  static const String changePassword = '/change-password';
  static const String reviewCouncil = '/review-council';
  static const String capstoneGrading = '/capstone-grading';
  // Routes Map
  static Map<String, WidgetBuilder> get routes => {
        login: (context) => const LoginScreen(),
        home: (context) => const HomeScreen(),
        profile: (context) => const UserProfileScreen(),
        changePassword: (context) => const ChangePasswordScreen(),
        reviewCouncil: (context) => const ReviewCouncilScreen(),
        capstoneGrading: (context) => const CapstoneGradingScreen(),
        // Thêm các routes khác ở đây
      };

  // On Generate Route (for dynamic routes with parameters)
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case topicDetail:
        final topicId = settings.arguments as int?;
        if (topicId == null) {
          return _errorRoute('Topic ID is required');
        }
        // return MaterialPageRoute(
        //   builder: (context) => TopicDetailScreen(topicId: topicId),
        // );
        return _errorRoute('Topic Detail Screen not implemented yet');
      
      default:
        return _errorRoute('Route not found: ${settings.name}');
    }
  }

  // Error Route
  static Route<dynamic> _errorRoute(String message) {
    return MaterialPageRoute(
      builder: (context) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Text(message),
        ),
      ),
    );
  }
}
