import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart'; // Đã import
import 'package:mobile/data/models/review_council.dart';
import 'package:mobile/data/services/review_council_service.dart';
import 'package:mobile/core/utils/date_time_utils.dart';
import 'dart:ui'; // Cần cho hàm _getStatusStyle

// Lớp AppColors của bạn (Đã thêm màu trạng thái)
class AppColors {
  static const fptOrange = Color(0xFFFF6B00);
  static const fptOrangePastel = Color(0xFFFFE5D3);
  static const cream = Color(0xFFFFF8F0);
  static const white = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF2D2D2D);
  static const textSecondary = Color(0xFF757575);
  static const borderColor = Color(0xFFE0E0E0);

  // Thêm màu mới cho trạng thái
  static const successGreen = Color(0xFF28a745);
  static const successGreenPastel = Color(0xFFE9F7EB);
  static const errorRed = Color(0xFFdc3545);
  static const errorRedPastel = Color(0xFFFDEEEE);
  static const infoBlue = Color(0xFF007bff);
  static const infoBluePastel = Color(0xFFE6F2FF);
}

class ReviewCouncilScreen extends StatefulWidget {
  const ReviewCouncilScreen({Key? key}) : super(key: key);

  @override
  State<ReviewCouncilScreen> createState() => _ReviewCouncilScreenState();
}

// Dùng record để trả về bộ 3 giá trị: (Màu nền, Màu chữ, Icon)
typedef StatusStyle = (Color, Color, IconData);

class _ReviewCouncilScreenState extends State<ReviewCouncilScreen> {
  late Future<List<ReviewCouncil>> _future;
  DateTime _selectedDate = DateTime.now();
  DateTime _focusedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    _future = ReviewCouncilService.getAllForCalendar();
  }

  Future<void> _refresh() async {
    setState(() => _future = ReviewCouncilService.getAllForCalendar());
    await _future;
  }

  /// ===================================================================
  /// HÀM TRỢ GIÚP MỚI: Quyết định màu sắc và icon dựa trên trạng thái
  /// ===================================================================
  StatusStyle _getStatusStyle(String? status) {
    String lowerStatus = status?.toLowerCase() ?? '';

    if (lowerStatus.contains('hoàn thành')) {
      return (
        AppColors.successGreenPastel,
        AppColors.successGreen,
        Icons.check_circle_outline
      );
    }
    if (lowerStatus.contains('hủy')) {
      return (
        AppColors.errorRedPastel,
        AppColors.errorRed,
        Icons.cancel_outlined
      );
    }
    if (lowerStatus.contains('sắp diễn ra')) {
      return (
        AppColors.infoBluePastel,
        AppColors.infoBlue,
        Icons.schedule_outlined
      );
    }
    // Trạng thái mặc định (Đang diễn ra, Chờ duyệt, ...)
    return (
      AppColors.fptOrangePastel,
      AppColors.fptOrange,
      Icons.hourglass_top_outlined
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        title: const Text('Hội đồng Review'),
        backgroundColor: AppColors.fptOrange,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refresh,
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.fptOrangePastel,
              AppColors.white,
              AppColors.cream,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: _refresh,
            child: FutureBuilder<List<ReviewCouncil>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return _ErrorView(
                    message: snapshot.error.toString(),
                    onRetry: _refresh,
                  );
                }

                final councils = snapshot.data ?? <ReviewCouncil>[];
                final Map<DateTime, List<ReviewCouncil>> events = {};
                for (final c in councils) {
                  if (c.reviewDate == null) continue;
                  final dt = DateTime(
                      c.reviewDate!.year, c.reviewDate!.month, c.reviewDate!.day);
                  events.putIfAbsent(dt, () => []).add(c);
                }
                final todaysEvents = events[DateTime(_selectedDate.year,
                        _selectedDate.month, _selectedDate.day)] ??
                    [];

                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      child: Card(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        child: TableCalendar(
                          // !!! TUYỆT VỜI! ĐÃ THÊM LẠI TIẾNG VIỆT
                          // vì bạn đã sửa main.dart
                          locale: 'vi_VN',
                          firstDay:
                              DateTime.now().subtract(const Duration(days: 365)),
                          lastDay: DateTime.now().add(const Duration(days: 365)),
                          focusedDay: _focusedDay,
                          calendarFormat: CalendarFormat.month,
                          selectedDayPredicate: (day) =>
                              isSameDay(_selectedDate, day),
                          onDaySelected: (selectedDay, focusedDay) {
                            setState(() {
                              _selectedDate = selectedDay;
                              _focusedDay = focusedDay;
                            });
                          },
                          onPageChanged: (focusedDay) {
                            _focusedDay = focusedDay;
                          },
                          eventLoader: (day) {
                            final dayOnly =
                                DateTime(day.year, day.month, day.day);
                            return events[dayOnly] ?? [];
                          },
                          calendarStyle: CalendarStyle(
                            markerDecoration: BoxDecoration(
                              color: AppColors.fptOrange,
                              shape: BoxShape.circle,
                            ),
                            todayDecoration: BoxDecoration(
                              color: AppColors.fptOrange.withOpacity(0.3),
                              shape: BoxShape.circle,
                            ),
                            selectedDecoration: BoxDecoration(
                              color: AppColors.fptOrange,
                              shape: BoxShape.circle,
                            ),
                            selectedTextStyle: TextStyle(color: AppColors.white),
                            todayTextStyle:
                                TextStyle(color: AppColors.textPrimary),
                          ),
                          headerStyle: HeaderStyle(
                            titleCentered: true,
                            formatButtonVisible: false,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // PHẦN LIST VIEW
                    Expanded(
                      child: todaysEvents.isEmpty
                          ? Center(
                              child: Text(
                                  'Không có hội đồng cho ngày ${DateTimeUtils.formatDate(_selectedDate)}'),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                              itemCount: todaysEvents.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final council = todaysEvents[index];
                                // Gọi _councilCard đã được nâng cấp
                                return _councilCard(council);
                              },
                            ),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  /// ===================================================================
  /// WIDGET ĐÃ NÂNG CẤP: _councilCard
  /// ===================================================================
  Widget _councilCard(ReviewCouncil council) {
    // 1. Lấy bộ style (màu nền, màu chữ, icon)
    final (bgColor, textColor, icon) = _getStatusStyle(council.status);

    return Card(
      elevation: 4, // Tăng độ nổi
      shadowColor: AppColors.fptOrange.withOpacity(0.15), // Thêm bóng mờ
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        // Bỏ border vì đã có shadow
        // side: const BorderSide(color: AppColors.borderColor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        // 2. Thêm CircleAvatar với icon và màu theo trạng thái
        leading: CircleAvatar(
          backgroundColor: bgColor,
          child: Icon(icon, color: textColor, size: 22),
        ),

        // 3. Title và Subtitle (Giữ nguyên)
        title: Text(
          council.councilName ?? 'Hội đồng #${council.councilID}',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            '${council.topicTitle ?? 'Chưa có đề tài'}',
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),

        // 4. Trailing (Tag trạng thái) với màu động
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: bgColor, // Màu nền động
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            council.status ?? 'N/A',
            style: TextStyle(
              color: textColor, // Màu chữ động
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ),
        onTap: () => _showCouncilDetailDialog(council),
      ),
    );
  }

  /// ===================================================================
  /// WIDGET TRỢ GIÚP MỚI: _buildDetailRow (dùng cho Dialog)
  /// ===================================================================
  Widget _buildDetailRow(IconData icon, String title, String? value) {
    // Nếu giá trị null hoặc rỗng, không hiển thị
    if (value == null || value.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.fptOrange, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style:
                        TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 15,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// ===================================================================
  /// DIALOG ĐÃ NÂNG CẤP: _showCouncilDetailDialog
  /// ===================================================================
  void _showCouncilDetailDialog(ReviewCouncil council) {
    // Lấy style cho tag trạng thái
    final (bgColor, textColor, icon) = _getStatusStyle(council.status);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        // Title được thiết kế lại
        title: Text(
          council.councilName ?? 'Hội đồng #${council.councilID}',
          style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 18),
        ),

        // Content được thiết kế lại hoàn toàn
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thêm tag trạng thái lên đầu dialog
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, color: textColor, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      council.status ?? 'N/A',
                      style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 24),

              // Dùng hàm _buildDetailRow mới để hiển thị
              _buildDetailRow(
                  Icons.topic_outlined, 'Đề tài', council.topicTitle),
              _buildDetailRow(
                  Icons.flag_outlined, 'Mốc', council.milestone),
              _buildDetailRow(Icons.calendar_today_outlined, 'Ngày chấm',
                  DateTimeUtils.formatDateTime(council.reviewDate)),
              _buildDetailRow(Icons.check_circle_outline, 'Kết quả',
                  council.result ?? 'Chưa có'),
              _buildDetailRow(
                  Icons.apartment_outlined, 'Phòng', council.roomNumber),
              _buildDetailRow(
                  Icons.videocam_outlined, 'Link', council.meetingLink),
              _buildDetailRow(
                  Icons.laptop_outlined, 'Hình thức', council.reviewFormat),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng',
                style: TextStyle(
                    color: AppColors.fptOrange, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

// Class _ErrorView giữ nguyên
class _ErrorView extends StatelessWidget {
  // ... (Không thay đổi) ...
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry, Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 48),
        Icon(Icons.error_outline, color: Colors.red.shade400, size: 64),
        const SizedBox(height: 12),
        Text(
          'Không thể tải thông tin',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            color: Colors.red.shade400,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        Center(
          child: OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Thử lại'),
          ),
        ),
      ],
    );
  }
}