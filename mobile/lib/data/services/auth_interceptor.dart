import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mobile/data/storage/token_storage.dart';

/// Interceptor tự động thêm token vào mọi API request
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Lấy token
    final token = await TokenStorage.getToken();
    
    if (token != null && token.isNotEmpty) {
      // Thêm Authorization header
      options.headers['Authorization'] = 'Bearer $token';
      print('🔑 Token added to request: ${options.path}');
    }
    
    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Xử lý lỗi 401 (Unauthorized - token expired)
    if (err.response?.statusCode == 401) {
      print('❌ 401 Unauthorized - Token expired or invalid');
      
      // Xóa token cũ
      await TokenStorage.clearAll();
      
      // TODO: Navigate to login (cần BuildContext)
      // Hoặc emit event để app handle
      
      // Optional: Thử refresh token nếu có
      // final newToken = await refreshToken();
      // if (newToken != null) {
      //   retry request with new token
      // }
    }
    
    return handler.next(err);
  }
}

/// Cập nhật Dio config để dùng interceptor
class DioConfig {
  static Dio createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:8080',
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors
    dio.interceptors.add(AuthInterceptor()); // ← Thêm auth interceptor
    dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => print('🌐 $obj'),
    ));

    return dio;
  }
}

/// Example: Sử dụng trong service
class UserService {
  static final Dio _dio = DioConfig.createDio();

  /// Get user profile (cần authentication)
  /// Token sẽ tự động được thêm vào header
  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/user/me');
      return response.data;
    } catch (e) {
      print('❌ Error getting profile: $e');
      rethrow;
    }
  }

  /// Update user profile
  static Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      await _dio.put('/user/profile', data: data);
      print('✅ Profile updated');
    } catch (e) {
      print('❌ Error updating profile: $e');
      rethrow;
    }
  }
}