import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/services/auth_interceptor.dart';
import 'package:dio/dio.dart';

class AuthService {
  static String get baseUrl => dotenv.env['BASE_URL'] ?? 'http://localhost:8080';
  static final Dio _dio = DioConfig.createDio();
  static Future<User> getProfile() async {
    final response = await _dio.get('/user/me');
    return User.fromJson(response.data);
  }
  static Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/account-service/api/auth/login');
      
      final response = await http.post(
        url,
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return LoginResponse.fromJson(data);
      } else {
        throw Exception(data['message'] ?? 'Đăng nhập thất bại');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }
}

/// Model cho Login Response
class LoginResponse {
  final int code;
  final String message;
  final LoginData? data;

  LoginResponse({
    required this.code,
    required this.message,
    this.data,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      code: json['code'] as int,
      message: json['message'] as String,
      data: json['data'] != null ? LoginData.fromJson(json['data']) : null,
    );
  }

  bool get isSuccess => code == 200;
}

class LoginData {
  final String role;
  final String token;
  final bool firstLogin;

  LoginData({
    required this.role,
    required this.token,
    required this.firstLogin,
  });

  factory LoginData.fromJson(Map<String, dynamic> json) {
    return LoginData(
      role: json['role'] as String,
      token: json['token'] as String,
      firstLogin: json['firstLogin'] as bool,
    );
  }
}