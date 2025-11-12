import 'package:flutter/material.dart';
import 'package:mobile/app.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  // BẮT BUỘC có dòng này khi hàm main là async
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: ".env");
  
  // BẠN THIẾU DÒNG NÀY:
  // Dòng này mới thực sự tải dữ liệu tiếng Việt (vi_VN)
  await initializeDateFormatting('vi_VN', null);

  runApp(const MyApp());
}