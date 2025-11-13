'use client';
import { useState, useEffect } from 'react';
import { Modal, Table, Typography, Empty, Spin, message, Button, Space } from 'antd';
import { WarningOutlined, FileTextOutlined } from '@ant-design/icons';
import { plagiarismService, PlagiarismResult } from '../services/plagiarismService';

const { Text } = Typography;

interface PlagiarismResultsModalProps {
  visible: boolean;
  topicId: number | null;
  onClose: () => void;
}

export default function PlagiarismResultsModal({
  visible,
  topicId,
  onClose,
}: PlagiarismResultsModalProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlagiarismResult[]>([]);

  useEffect(() => {
    if (visible && topicId) {
      loadPlagiarismResults();
    }
  }, [visible, topicId]);

  const loadPlagiarismResults = async () => {
    if (!topicId) return;

    setLoading(true);
    try {
      const data = await plagiarismService.getPlagiarismResults(topicId);
      setResults(data);
      if (data.length === 0) {
        message.info('Đề tài này không có kết quả đạo văn');
      }
    } catch (error) {
      console.error('Error loading plagiarism results:', error);
      message.error('Không thể tải danh sách đạo văn');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: '50px',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'ID Đề tài bị đạo văn',
      dataIndex: 'plagiarizedTopicId',
      key: 'plagiarizedTopicId',
      width: '100px',
      render: (id: number | null) => (
        <Text strong>{id || 'N/A'}</Text>
      ),
    },
    {
      title: 'Nội dung đạo văn',
      dataIndex: 'plagiarizedContent',
      key: 'plagiarizedContent',
      width: '35%',
      ellipsis: true,
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: '100%' }}>
          {text || 'N/A'}
        </Text>
      ),
    },
    {
      title: 'File URL bị đạo văn',
      dataIndex: 'plagiarizedFileUrl',
      key: 'plagiarizedFileUrl',
      width: '20%',
      ellipsis: true,
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button size="small" icon={<FileTextOutlined />}>
            Xem file
          </Button>
        </a>
      ),
    },
    {
      title: 'Ngày phát hiện',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '140px',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          <span>Danh sách đạo văn</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {results.length === 0 && !loading ? (
          <Empty
            description="Không có kết quả đạo văn"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={results}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} kết quả`,
            }}
            bordered
          />
        )}
      </Spin>
    </Modal>
  );
}
