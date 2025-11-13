class Account {
  final int id;
  final String name;
  final String email;
  final String? phoneNumber;
  final String role;

  Account({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phoneNumber,
  });

  factory Account.fromJson(Map<String, dynamic> json) => Account(
    id: json['id'] as int,
    name: json['name'] as String,
    email: json['email'] as String,
    phoneNumber: json['phoneNumber'] as String?,
    role: json['role'] as String,
  );
}
