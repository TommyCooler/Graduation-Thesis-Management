/// API Response Wrapper
class ApiResponse<T> {
  final int code;
  final String message;
  final T? data;
  final T? result;

  ApiResponse({
    required this.code,
    required this.message,
    this.data,
    this.result,
  });

  /// From JSON
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      code: json['code'] as int,
      message: json['message'] as String,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : null,
      result: json['result'] != null && fromJsonT != null
          ? fromJsonT(json['result'])
          : null,
    );
  }

  /// Check if response is successful
  bool get isSuccess => code == 200 || code == 201;

  /// Get data or result
  T? get payload => data ?? result;
}
