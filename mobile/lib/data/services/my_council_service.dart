import 'package:dio/dio.dart';
import 'package:mobile/data/models/my_council_item.dart';
import 'package:mobile/data/services/auth_interceptor.dart';

class MyCouncilService {
  static final Dio _dio = DioConfig.createDio();

  /// Lấy danh sách hội đồng của người dùng hiện tại
  static Future<List<MyCouncilItem>> getMyCouncils() async {
    try {
      print('📡 Calling API: /topic-approval-service/api/councils/my-councils');
      final response = await _dio.get('/topic-approval-service/api/councils/my-councils');
      final data = response.data;

      print('✅ API Response: $data');

      if (data != null && data['code'] == 200 && data['data'] != null) {
        final councils = (data['data'] as List)
            .map((e) => MyCouncilItem.fromJson(e as Map<String, dynamic>))
            .toList();
        print('✅ Parsed ${councils.length} councils');
        return councils;
      } else {
        // Nếu không có dữ liệu, trả về mảng rỗng
        if (data != null && 
            (data['message']?.toString().toLowerCase().contains('not found') == true ||
             data['message']?.toString().toLowerCase().contains('no councils') == true)) {
          print('ℹ️ No councils found');
          return [];
        }
        throw Exception(data['message']?.toString() ?? 'Lỗi không xác định');
      }
    } catch (e) {
      print('❌ Error fetching my councils: $e');
      
      if (e is DioException) {
        print('❌ DioException details:');
        print('   Status Code: ${e.response?.statusCode}');
        print('   Response Data: ${e.response?.data}');
        print('   Request Path: ${e.requestOptions.path}');
        print('   Request Headers: ${e.requestOptions.headers}');
        
        // Xử lý các status code khác nhau
        if (e.response?.statusCode == 400) {
          final errorData = e.response?.data;
          final errorMessage = errorData is Map 
              ? (errorData['message']?.toString() ?? 'Bad Request')
              : 'Bad Request';
          
          // Nếu là "Council member not found", đây là trường hợp hợp lệ (user chưa được phân công)
          if (errorMessage.toLowerCase().contains('council member not found') ||
              errorMessage.toLowerCase().contains('member not found')) {
            print('ℹ️ User is not a member of any council yet');
            return [];
          }
          
          throw Exception('Lỗi 400: $errorMessage');
        }
        
        if (e.response?.statusCode == 401) {
          throw Exception('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (e.response?.statusCode == 404) {
          final errorData = e.response?.data;
          final errorMessage = errorData is Map 
              ? (errorData['message']?.toString() ?? 'Not Found')
              : 'Not Found';
          
          // Nếu là "Council member not found", đây là trường hợp hợp lệ
          if (errorMessage.toLowerCase().contains('council member not found') ||
              errorMessage.toLowerCase().contains('member not found')) {
            print('ℹ️ User is not a member of any council yet (404)');
            return [];
          }
          
          return [];
        }
      }
      
      rethrow;
    }
  }
}

