/// Topic Model
class Topic {
  final int id;
  final String title;
  final String description;
  final String? submitedAt;
  final String status;
  final String? filePathUrl;
  final String createdAt;
  final String updatedAt;

  Topic({
    required this.id,
    required this.title,
    required this.description,
    this.submitedAt,
    required this.status,
    this.filePathUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  /// From JSON
  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      submitedAt: json['submitedAt'] as String?,
      status: json['status'] as String,
      filePathUrl: json['filePathUrl'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }

  /// To JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'submitedAt': submitedAt,
      'status': status,
      'filePathUrl': filePathUrl,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  /// Copy With
  Topic copyWith({
    int? id,
    String? title,
    String? description,
    String? submitedAt,
    String? status,
    String? filePathUrl,
    String? createdAt,
    String? updatedAt,
  }) {
    return Topic(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      submitedAt: submitedAt ?? this.submitedAt,
      status: status ?? this.status,
      filePathUrl: filePathUrl ?? this.filePathUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
