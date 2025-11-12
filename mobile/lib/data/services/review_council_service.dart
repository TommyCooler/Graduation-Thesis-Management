import 'package:dio/dio.dart';
import 'package:mobile/data/models/review_council.dart';
import 'package:mobile/data/services/auth_interceptor.dart';

class ReviewCouncilService {
  static final Dio _dio = DioConfig.createDio();

  /// Lấy danh sách hội đồng dùng cho lịch
  static Future<List<ReviewCouncil>> getAllForCalendar() async {
    try {
      final res = await _dio.get('/topic-approval-service/api/progress-review-councils');
      final data = res.data;

      if (data != null && data['code'] == 200 && data['data'] != null) {
        final councils = (data['data'] as List)
            .map((e) => ReviewCouncil.fromJson(e as Map<String, dynamic>))
            .toList();
        return councils;
      } else {
        throw Exception(data['message'] ?? 'Lỗi không xác định');
      }
    } catch (e) {
      print('❌ Error fetching review councils for calendar: $e');
      rethrow;
    }
  }
}
