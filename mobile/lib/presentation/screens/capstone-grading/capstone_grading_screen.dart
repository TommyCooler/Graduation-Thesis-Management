import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/data/models/my_council_item.dart';
import 'package:mobile/data/services/my_council_service.dart';
import 'package:mobile/core/utils/date_time_utils.dart';

// Dùng record để trả về bộ 3 giá trị: (Màu nền, Màu chữ, Icon)
typedef StatusStyle = (Color, Color, IconData);

class CapstoneGradingScreen extends StatefulWidget {
  const CapstoneGradingScreen({super.key});

  @override
  State<CapstoneGradingScreen> createState() => _CapstoneGradingScreenState();
}

class _CapstoneGradingScreenState extends State<CapstoneGradingScreen> {
  late Future<List<MyCouncilItem>> _future;
  DateTime _selectedDate = DateTime.now();
  DateTime _focusedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    _future = MyCouncilService.getMyCouncils();
  }

  Future<void> _refresh() async {
    setState(() => _future = MyCouncilService.getMyCouncils());
    await _future;
  }

  /// Quyết định màu sắc và icon dựa trên trạng thái
  StatusStyle _getStatusStyle(String status) {
    switch (status) {
      case 'COMPLETED':
        return (
          AppColors.successGreenPastel,
          AppColors.successGreen,
          Icons.check_circle_outline
        );
      case 'CANCELLED':
        return (
          AppColors.errorRedPastel,
          AppColors.errorRed,
          Icons.cancel_outlined
        );
      case 'PLANNED':
        return (
          AppColors.infoBluePastel,
          AppColors.infoBlue,
          Icons.schedule_outlined
        );
      case 'RETAKING':
        return (
          Colors.purple.withOpacity(0.1),
          Colors.purple,
          Icons.refresh
        );
      case 'IN_PROGRESS':
      default:
        return (
          AppColors.fptOrangePastel,
          AppColors.fptOrange,
          Icons.hourglass_top_outlined
        );
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PLANNED':
        return 'Đã lập';
      case 'IN_PROGRESS':
        return 'Đang chấm';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'RETAKING':
        return 'Đang chấm lại';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  String _getRoleText(String role) {
    switch (role) {
      case 'CHAIRMAN':
        return 'Chủ tịch';
      case 'SECRETARY':
        return 'Thư ký';
      case 'MEMBER':
        return 'Thành viên';
      default:
        return role;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(
        title: const Text('Chấm Capstone'),
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
            child: FutureBuilder<List<MyCouncilItem>>(
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

                final councils = snapshot.data ?? <MyCouncilItem>[];
                
                // Tạo map events từ defenseDate
                final Map<DateTime, List<MyCouncilItem>> events = {};
                for (final c in councils) {
                  try {
                    final defenseDate = DateTime.parse(c.defenseDate);
                    final dayOnly = DateTime(defenseDate.year, defenseDate.month, defenseDate.day);
                    events.putIfAbsent(dayOnly, () => []).add(c);
                  } catch (e) {
                    // Bỏ qua nếu không parse được date
                  }
                }

                // Lấy events của ngày được chọn
                final selectedDayOnly = DateTime(_selectedDate.year, _selectedDate.month, _selectedDate.day);
                final todaysEvents = events[selectedDayOnly] ?? [];

                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      child: Card(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        child: TableCalendar(
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
                      child: councils.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.inbox, size: 64, color: Colors.grey),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'Chưa có hội đồng nào',
                                    style: TextStyle(
                                      fontSize: 18,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Bạn chưa được phân công vào hội đồng nào',
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                ],
                              ),
                            )
                          : todaysEvents.isEmpty
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

  /// Widget hiển thị card hội đồng
  Widget _councilCard(MyCouncilItem council) {
    final (bgColor, textColor, icon) = _getStatusStyle(council.status);

    return Card(
      elevation: 4,
      shadowColor: AppColors.fptOrange.withOpacity(0.15),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        leading: CircleAvatar(
          backgroundColor: bgColor,
          child: Icon(icon, color: textColor, size: 22),
        ),
        title: Text(
          council.councilName,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                council.topicsTitle,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.access_time, size: 12, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    _formatTime(council.defenseTime),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Icon(Icons.person_outline, size: 12, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(
                    _getRoleText(council.role),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            _getStatusText(council.status),
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ),
        onTap: () => _showCouncilDetailDialog(council),
      ),
    );
  }

  String _formatTime(String timeString) {
    try {
      if (timeString.length >= 5) {
        return timeString.substring(0, 5);
      }
      return timeString;
    } catch (e) {
      return timeString;
    }
  }

  /// Widget trợ giúp: _buildDetailRow (dùng cho Dialog)
  Widget _buildDetailRow(IconData icon, String title, String? value) {
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

  /// Dialog hiển thị chi tiết hội đồng
  void _showCouncilDetailDialog(MyCouncilItem council) {
    final (bgColor, textColor, icon) = _getStatusStyle(council.status);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          council.councilName,
          style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 18),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Tag trạng thái
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
                      _getStatusText(council.status),
                      style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 24),
              // Chi tiết
              _buildDetailRow(
                  Icons.topic_outlined, 'Đề tài', council.topicsTitle),
              _buildDetailRow(Icons.description_outlined, 'Mô tả',
                  council.topicsDescription),
              _buildDetailRow(
                  Icons.person_outline, 'Vai trò', _getRoleText(council.role)),
              _buildDetailRow(Icons.calendar_today_outlined, 'Ngày chấm',
                  DateTimeUtils.formatDate(DateTime.parse(council.defenseDate))),
              _buildDetailRow(Icons.access_time, 'Giờ chấm',
                  _formatTime(council.defenseTime)),
              _buildDetailRow(
                  Icons.school_outlined, 'Học kỳ', council.semester),
              if (council.retakeDate != null)
                _buildDetailRow(
                    Icons.refresh,
                    'Ngày chấm lại',
                    DateTimeUtils.formatDate(DateTime.parse(council.retakeDate!))),
              if (council.fileUrl.isNotEmpty)
                _buildDetailRow(Icons.attach_file, 'File đính kèm',
                    council.fileUrl),
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

// Class _ErrorView
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

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
