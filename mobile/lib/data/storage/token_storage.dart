import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

/// Service quản lý token và user info
/// 
/// Sử dụng FlutterSecureStorage để lưu token an toàn
/// và SharedPreferences cho các thông tin không nhạy cảm
class TokenStorage {
  // Secure Storage cho token (encrypted)
  static const _secureStorage = FlutterSecureStorage();
  
  // Keys
  static const _keyToken = 'auth_token';
  static const _keyRefreshToken = 'refresh_token';
  static const _keyRole = 'user_role';
  static const _keyEmail = 'user_email';
  static const _keyFirstLogin = 'first_login';
  static const _keyIsLoggedIn = 'is_logged_in';

  // ==================== TOKEN MANAGEMENT ====================
  
  /// Lưu token (secure)
  static Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _keyToken, value: token);
    print('✅ Token saved securely');
  }

  /// Lấy token
  static Future<String?> getToken() async {
    return await _secureStorage.read(key: _keyToken);
  }

  /// Xóa token
  static Future<void> deleteToken() async {
    await _secureStorage.delete(key: _keyToken);
    print('🗑️ Token deleted');
  }

  /// Check có token không
  static Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // ==================== REFRESH TOKEN ====================
  
  /// Lưu refresh token (nếu backend có)
  static Future<void> saveRefreshToken(String refreshToken) async {
    await _secureStorage.write(key: _keyRefreshToken, value: refreshToken);
  }

  /// Lấy refresh token
  static Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _keyRefreshToken);
  }

  // ==================== USER INFO ====================
  
  /// Lưu toàn bộ thông tin user sau khi login
  static Future<void> saveLoginData({
    required String token,
    required String role,
    required String email,
    required bool firstLogin,
    String? refreshToken,
  }) async {
    // Lưu token (secure)
    await saveToken(token);
    
    if (refreshToken != null) {
      await saveRefreshToken(refreshToken);
    }
    
    // Lưu user info (SharedPreferences)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyRole, role);
    await prefs.setString(_keyEmail, email);
    await prefs.setBool(_keyFirstLogin, firstLogin);
    await prefs.setBool(_keyIsLoggedIn, true);
    
    print('✅ Login data saved:');
    print('   - Role: $role');
    print('   - Email: $email');
    print('   - First login: $firstLogin');
  }

  /// Lấy role
  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRole);
  }

  /// Lấy email
  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyEmail);
  }

  /// Check first login
  static Future<bool> isFirstLogin() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyFirstLogin) ?? false;
  }

  /// Check đã login chưa
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool(_keyIsLoggedIn) ?? false;
    final hasToken = await TokenStorage.hasToken();
    
    return isLoggedIn && hasToken;
  }

  // ==================== LOGOUT ====================
  
  /// Xóa tất cả dữ liệu khi logout
  static Future<void> clearAll() async {
    // Xóa secure storage
    await _secureStorage.deleteAll();
    
    // Xóa shared preferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyRole);
    await prefs.remove(_keyEmail);
    await prefs.remove(_keyFirstLogin);
    await prefs.remove(_keyIsLoggedIn);
    
    print('🗑️ All user data cleared');
  }

  // ==================== HELPERS ====================
  
  /// Lấy toàn bộ user info
  static Future<Map<String, dynamic>> getUserInfo() async {
    final token = await getToken();
    final role = await getRole();
    final email = await getEmail();
    final firstLogin = await isFirstLogin();
    
    return {
      'token': token,
      'role': role,
      'email': email,
      'firstLogin': firstLogin,
      'isLoggedIn': await isLoggedIn(),
    };
  }

  /// Print user info (debug)
  static Future<void> printUserInfo() async {
    final info = await getUserInfo();
    print('👤 User Info:');
    print('   - Token: ${info['token']?.toString().substring(0, 20)}...');
    print('   - Role: ${info['role']}');
    print('   - Email: ${info['email']}');
    print('   - First login: ${info['firstLogin']}');
    print('   - Is logged in: ${info['isLoggedIn']}');
  }

  // ==================== TOKEN VALIDATION ====================
  
  /// Decode JWT token (basic - không verify signature)
  static Map<String, dynamic>? decodeToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      
      final payload = parts[1];
      final normalized = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(normalized));
      
      return jsonDecode(decoded);
    } catch (e) {
      print('❌ Error decoding token: $e');
      return null;
    }
  }

  /// Check token còn hạn không
  static Future<bool> isTokenValid() async {
    final token = await getToken();
    if (token == null) return false;
    
    final decoded = decodeToken(token);
    if (decoded == null) return false;
    
    final exp = decoded['exp'];
    if (exp == null) return true; // Nếu không có exp thì coi như valid
    
    final expiryDate = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
    final now = DateTime.now();
    
    return expiryDate.isAfter(now);
  }

  /// Lấy thời gian hết hạn của token
  static Future<DateTime?> getTokenExpiry() async {
    final token = await getToken();
    if (token == null) return null;
    
    final decoded = decodeToken(token);
    if (decoded == null) return null;
    
    final exp = decoded['exp'];
    if (exp == null) return null;
    
    return DateTime.fromMillisecondsSinceEpoch(exp * 1000);
  }
}

// Import cần thiết (thêm vào đầu file)