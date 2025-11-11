import 'package:dio/dio.dart';
import 'package:mobile/data/models/topic.dart';
import 'package:mobile/data/services/auth_interceptor.dart';

class TopicService {
  static final Dio _dio = DioConfig.createDio(); // reuse Dio config with interceptor

  /// Lấy danh sách các topic đã approved
  static Future<List<Topic>> getApprovedTopics() async {
    try {
      final res = await _dio.get('/topic-service/api/topics/approved');
      final data = res.data;

      if (data['code'] == 200 && data['data'] != null) {
        final topics = (data['data'] as List)
            .map((e) => Topic.fromJson(e as Map<String, dynamic>))
            .toList();
        return topics;
      } else {
        throw Exception(data['message'] ?? 'Lỗi không xác định');
      }
    } catch (e) {
      print('❌ Error fetching approved topics: $e');
      rethrow;
    }
  }
}
