import 'package:flutter/material.dart';
import 'package:mobile/data/models/topic.dart';
import 'package:mobile/data/services/topic_service.dart';

class AppColors {
  static const fptOrange = Color(0xFFFF6B00);
  static const fptOrangePastel = Color(0xFFFFE5D3);
  static const cream = Color(0xFFFFF8F0);
  static const white = Color(0xFFFFFFFF);
  static const textPrimary = Color(0xFF2D2D2D);
  static const textSecondary = Color(0xFF757575);
  static const borderColor = Color(0xFFE0E0E0);
}

class ReviewCouncilScreen extends StatefulWidget {
  const ReviewCouncilScreen({Key? key}) : super(key: key);

  @override
  State<ReviewCouncilScreen> createState() => _ReviewCouncilScreenState();
}

class _ReviewCouncilScreenState extends State<ReviewCouncilScreen> {
  late Future<List<Topic>> _future;

  @override
  void initState() {
    super.initState();
    _future = TopicService.getApprovedTopics();
  }

  Future<void> _refresh() async {
    setState(() => _future = TopicService.getApprovedTopics());
    await _future;
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
            child: FutureBuilder<List<Topic>>(
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
                final topics = snapshot.data!;
                if (topics.isEmpty) {
                  return const Center(
                    child: Text('Không có topic nào'),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: topics.length,
                  itemBuilder: (context, index) {
                    final topic = topics[index];
                    return _topicCard(topic);
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _topicCard(Topic topic) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.borderColor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        title: Text(
          topic.title,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            topic.description,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.fptOrangePastel,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            topic.status,
            style: const TextStyle(
              color: AppColors.fptOrange,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        onTap: () {
          _showTopicDetailDialog(topic);
        },
      ),
    );
  }

  void _showTopicDetailDialog(Topic topic) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(topic.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Mô tả: ${topic.description}'),
            const SizedBox(height: 8),
            Text('Trạng thái: ${topic.status}'),
            const SizedBox(height: 8),
            Text('Ngày tạo: ${topic.createdAt}'),
            Text('Ngày cập nhật: ${topic.updatedAt}'),
            if (topic.submitedAt != null)
              Text('Ngày nộp: ${topic.submitedAt}'),
            if (topic.filePathUrl != null)
              Text('File đính kèm: ${topic.filePathUrl}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
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
