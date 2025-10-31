/// Validation Utilities
class Validators {
  /// Email Validation
  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập email';
    }
    
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Email không hợp lệ';
    }
    
    return null;
  }

  /// Password Validation
  static String? password(String? value, {int minLength = 6}) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập mật khẩu';
    }
    
    if (value.length < minLength) {
      return 'Mật khẩu tối thiểu $minLength ký tự';
    }
    
    return null;
  }

  /// Required Field Validation
  static String? required(String? value, {String fieldName = 'Trường này'}) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName không được để trống';
    }
    return null;
  }

  /// Phone Number Validation (Vietnam)
  static String? phoneNumber(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập số điện thoại';
    }
    
    final phoneRegex = RegExp(r'^(0|\+84)[0-9]{9}$');
    if (!phoneRegex.hasMatch(value.trim())) {
      return 'Số điện thoại không hợp lệ';
    }
    
    return null;
  }

  /// Min Length Validation
  static String? minLength(String? value, int min) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập dữ liệu';
    }
    
    if (value.length < min) {
      return 'Tối thiểu $min ký tự';
    }
    
    return null;
  }

  /// Max Length Validation
  static String? maxLength(String? value, int max) {
    if (value != null && value.length > max) {
      return 'Tối đa $max ký tự';
    }
    return null;
  }

  /// Confirm Password Validation
  static String? confirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    
    if (value != password) {
      return 'Mật khẩu không khớp';
    }
    
    return null;
  }
}
