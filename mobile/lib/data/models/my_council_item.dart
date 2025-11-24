class MyCouncilItem {
  final String role;
  final int? councilId;
  final int? councilMemberId;
  final String councilName;
  final String semester;
  final String defenseDate;
  final String status;
  final String? topicStatus;
  final String topicsTitle;
  final String topicsDescription;
  final String fileUrl;
  final String defenseTime;
  final int? topicId;
  final String? retakeDate;

  MyCouncilItem({
    required this.role,
    this.councilId,
    this.councilMemberId,
    required this.councilName,
    required this.semester,
    required this.defenseDate,
    required this.status,
    this.topicStatus,
    required this.topicsTitle,
    required this.topicsDescription,
    required this.fileUrl,
    required this.defenseTime,
    this.topicId,
    this.retakeDate,
  });

  factory MyCouncilItem.fromJson(Map<String, dynamic> json) {
    return MyCouncilItem(
      role: json['role']?.toString() ?? '',
      councilId: json['councilId'] != null
          ? (json['councilId'] is num
              ? (json['councilId'] as num).toInt()
              : int.tryParse(json['councilId'].toString()))
          : null,
      councilMemberId: json['councilMemberId'] != null
          ? (json['councilMemberId'] is num
              ? (json['councilMemberId'] as num).toInt()
              : int.tryParse(json['councilMemberId'].toString()))
          : null,
      councilName: json['councilName']?.toString() ?? '',
      semester: json['semester']?.toString() ?? '',
      defenseDate: json['defenseDate']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      topicStatus: json['topicStatus']?.toString(),
      topicsTitle: json['topicsTitle']?.toString() ?? '',
      topicsDescription: json['topicsDescription']?.toString() ?? '',
      fileUrl: json['fileUrl']?.toString() ?? '',
      defenseTime: json['defenseTime']?.toString() ?? '',
      topicId: json['topicId'] != null
          ? (json['topicId'] is num
              ? (json['topicId'] as num).toInt()
              : int.tryParse(json['topicId'].toString()))
          : null,
      retakeDate: json['retakeDate']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'councilId': councilId,
      'councilMemberId': councilMemberId,
      'councilName': councilName,
      'semester': semester,
      'defenseDate': defenseDate,
      'status': status,
      'topicStatus': topicStatus,
      'topicsTitle': topicsTitle,
      'topicsDescription': topicsDescription,
      'fileUrl': fileUrl,
      'defenseTime': defenseTime,
      'topicId': topicId,
      'retakeDate': retakeDate,
    };
  }
}

