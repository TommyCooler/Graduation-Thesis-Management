/// App Constants
class AppConstants {
  // App Info
  static const String appName = 'FPT Thesis Management';
  static const String appVersion = '1.0.0';
  
  // API
  static const String baseUrl = 'http://localhost:8080';
  static const String apiPrefix = '/api';
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  
  // Timeout
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 100;
}
