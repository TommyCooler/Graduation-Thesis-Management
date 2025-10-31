/// Environment Configuration
class EnvConfig {
  // Development
  static const String devApiUrl = 'http://localhost:8080';
  
  // Staging
  static const String stagingApiUrl = 'https://staging-api.example.com';
  
  // Production
  static const String prodApiUrl = 'https://api.example.com';
  
  // Current environment
  static const String environment = String.fromEnvironment(
    'ENV',
    defaultValue: 'dev',
  );
  
  // Get current API URL based on environment
  static String get apiUrl {
    switch (environment) {
      case 'prod':
        return prodApiUrl;
      case 'staging':
        return stagingApiUrl;
      default:
        return devApiUrl;
    }
  }
  
  // Is Production
  static bool get isProduction => environment == 'prod';
  
  // Is Development
  static bool get isDevelopment => environment == 'dev';
  
  // Is Staging
  static bool get isStaging => environment == 'staging';
}
