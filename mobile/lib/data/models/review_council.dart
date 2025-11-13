class ReviewCouncil {
  final int councilID;
  final String? councilName;
  final int? topicID;
  final String? topicTitle;
  final String? milestone; // keep as String (enum on backend)
  final DateTime? reviewDate;
  final String? status;
  final String? result;
  final DateTime? createdAt;
  final String? reviewFormat; // keep as String
  final String? meetingLink;
  final String? roomNumber;

  ReviewCouncil({
    required this.councilID,
    this.councilName,
    this.topicID,
    this.topicTitle,
    this.milestone,
    this.reviewDate,
    this.status,
    this.result,
    this.createdAt,
    this.reviewFormat,
    this.meetingLink,
    this.roomNumber,
  });

  factory ReviewCouncil.fromJson(Map<String, dynamic> json) {
    DateTime? _parseDate(dynamic v) {
      if (v == null) return null;
      try {
        return DateTime.parse(v.toString());
      } catch (e) {
        return null;
      }
    }

    return ReviewCouncil(
      councilID: (json['councilID'] is int)
          ? json['councilID'] as int
          : (json['councilID'] is num ? (json['councilID'] as num).toInt() : int.parse(json['councilID'].toString())),
      councilName: json['councilName']?.toString(),
      topicID: json['topicID'] != null
          ? (json['topicID'] is num ? (json['topicID'] as num).toInt() : int.tryParse(json['topicID'].toString()))
          : null,
      topicTitle: json['topicTitle']?.toString(),
      milestone: json['milestone']?.toString(),
      reviewDate: _parseDate(json['reviewDate']),
      status: json['status']?.toString(),
      result: json['result']?.toString(),
      createdAt: _parseDate(json['createdAt']),
      reviewFormat: json['reviewFormat']?.toString(),
      meetingLink: json['meetingLink']?.toString(),
      roomNumber: json['roomNumber']?.toString(),
    );
  }
}
