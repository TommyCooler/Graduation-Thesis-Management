/// String Extension Utilities
extension StringExtension on String {
  /// Capitalize first letter
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Check if string is valid email
  bool get isValidEmail {
    return RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(this);
  }

  /// Check if string is valid phone number (Vietnam)
  bool get isValidPhone {
    return RegExp(r'^(0|\+84)[0-9]{9}$').hasMatch(this);
  }

  /// Remove all whitespace
  String removeWhitespace() {
    return replaceAll(RegExp(r'\s+'), '');
  }

  /// Truncate string with ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$ellipsis';
  }
}

/// Num Extension Utilities
extension NumExtension on num {
  /// Format number with thousand separator
  String formatWithThousandSeparator() {
    return toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  /// Format currency (VND)
  String formatCurrency() {
    return '${formatWithThousandSeparator()} ₫';
  }
}
