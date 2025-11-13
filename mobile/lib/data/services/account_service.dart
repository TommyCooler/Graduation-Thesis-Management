import 'package:mobile/data/models/account.dart';
import 'package:mobile/data/services/auth_interceptor.dart';
import 'package:dio/dio.dart';
import 'package:mobile/data/storage/token_storage.dart';

class AccountService {
  static final Dio _dio = DioConfig.createDio();

  static Future<Account> getCurrentAccount() async {
    try {
      final res = await _dio.get(
        '/account-service/api/accounts/current-account',
      );
      final data = res.data;

      // Server trả { code, message, data }
      if (data['code'] == 200 && data['data'] != null) {
        return Account.fromJson(data['data']);
      } else {
        throw Exception(data['message'] ?? 'Lỗi không xác định');
      }
    } catch (e) {
      print('❌ Error fetching current account: $e');
      rethrow;
    }
  }

  static Future<String> changeFirstLoginPassWord({
    required String newPassword,
  }) async {
    final email = await TokenStorage.getEmail();
    if (email == null) {
      throw Exception('Email không tồn tại trong storage');
    }
    try {
      final res = await _dio.post(
        '/account-service/api/auth/password/change-first-login',
        data: {'email': email, 'newPassword': newPassword},
      );
      final data = res.data;

      // Server trả { code, message, data }
      if (data['code'] == 200) {
        return (data['message'] ?? 'Đổi mật khẩu thành công').toString();
      } else {
        throw Exception(data['message'] ?? 'Lỗi không xác định');
      }
    } catch (e) {
      print('❌ Error changing password: $e');
      rethrow;
    }
  }
}
