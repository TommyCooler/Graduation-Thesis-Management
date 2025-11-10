// lib/data/services/google_auth_service.dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GoogleAuthService {
  static  String get _webClientId => dotenv.env['WEB_CLIENT_ID'] ?? '';
  static String get baseUrl => dotenv.env['BASE_URL'] ?? 'http://localhost:8080';
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId: _webClientId,
  );

  static Future<GoogleSignInResponse> signInWithGoogle() async {
    try {
      print('🔵 Starting Google Sign-In...');
      print('🔵 Package: com.example.mobile');
      print('🔵 Web Client ID: $_webClientId');
      
      // Sign out để test lại từ đầu
      await _googleSignIn.signOut();
      print('🔵 Signed out, starting fresh...');
      
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        print('❌ User cancelled sign-in');
        throw Exception('Đăng nhập bị hủy');
      }

      print('✅ Google user: ${googleUser.email}');
      print('✅ Display name: ${googleUser.displayName}');
      
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      print('🔵 Access token exists: ${googleAuth.accessToken != null}');
      print('🔵 ID token exists: ${googleAuth.idToken != null}');
      
      final String? idToken = googleAuth.idToken;
      
      if (idToken == null) {
        print('❌ No idToken received');
        print('❌ This usually means serverClientId is wrong');
        throw Exception('Không lấy được ID token từ Google');
      }

      print('✅ Got idToken: ${idToken.substring(0, 20)}...');
      
      return GoogleSignInResponse(
        idToken: idToken,
        email: googleUser.email,
        displayName: googleUser.displayName ?? '',
        photoUrl: googleUser.photoUrl,
      );
      
    } on PlatformException catch (e) {
      print('❌ PlatformException code: ${e.code}');
      print('❌ Message: ${e.message}');
      print('❌ Details: ${e.details}');
      
      if (e.code == 'sign_in_failed') {
        if (e.message?.contains('10') == true) {
          throw Exception('Lỗi cấu hình: Vui lòng kiểm tra SHA-1 fingerprint và Package Name trong Google Console');
        }
      }
      rethrow;
    } catch (e) {
      print('❌ Google Sign-In Error: $e');
      rethrow;
    }
  }

  /// Gửi idToken lên backend để xác thực
  static Future<BackendAuthResponse> authenticateWithBackend(String idToken) async {
    try {
      print('🔵 Sending idToken to backend...');
      
      final response = await http.post(
        Uri.parse('$baseUrl/account-service/api/auth/google/mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );

      print('📥 Backend response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        print('✅ Authentication successful!');
        
        return BackendAuthResponse(
          accessToken: data['accessToken'],
          tokenType: data['tokenType'] ?? 'Bearer',
          expiresIn: data['expiresIn'],
          user: UserInfo(
            id: data['user']['id'],
            name: data['user']['name'],
            email: data['user']['email'],
            role: data['user']['role'],
          ),
        );
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Xác thực thất bại');
      }
      
    } catch (e) {
      print('❌ Backend auth error: $e');
      rethrow;
    }
  }

  /// Sign out
  static Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}

// Models
class GoogleSignInResponse {
  final String idToken;
  final String email;
  final String displayName;
  final String? photoUrl;

  GoogleSignInResponse({
    required this.idToken,
    required this.email,
    required this.displayName,
    this.photoUrl,
  });
}

class BackendAuthResponse {
  final String accessToken;
  final String tokenType;
  final int expiresIn;
  final UserInfo user;

  BackendAuthResponse({
    required this.accessToken,
    required this.tokenType,
    required this.expiresIn,
    required this.user,
  });
}

class UserInfo {
  final int id;
  final String name;
  final String email;
  final String role;

  UserInfo({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });
}