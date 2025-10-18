import React from 'react';
import { Timeline, Tag, Typography, Card, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { TopicHistory } from '../types/topic-history';
import topicHistoryService from '../services/topicHistoryService';

const { Text } = Typography;

interface TopicHistoryTimelineProps {
  history: TopicHistory[];
  topicId?: number;
  showUser?: boolean;
  maxItems?: number;
}

const TopicHistoryTimeline: React.FC<TopicHistoryTimelineProps> = ({
  history,
  topicId,
  showUser = true,
  maxItems = 10,
}) => {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return <PlusOutlined />;
      case 'UPDATE':
        return <EditOutlined />;
      case 'DELETE':
        return <DeleteOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getActionColor = (actionType: string) => {
    return topicHistoryService.getActionColor(actionType);
  };

  const getActionText = (actionType: string) => {
    return topicHistoryService.getActionText(actionType);
  };

  // Filter by topicId if provided
  const filteredHistory = topicId 
    ? history.filter(h => h.topicId === topicId)
    : history;

  // Sort by date (newest first) and limit items
  const sortedHistory = filteredHistory
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  if (sortedHistory.length === 0) {
    return (
      <Card size="small">
        <div className="text-center py-4">
          <Text type="secondary">Chưa có lịch sử thay đổi nào</Text>
        </div>
      </Card>
    );
  }

  return (
    <Timeline>
      {sortedHistory.map((item, index) => (
        <Timeline.Item
          key={item.id}
          color={getActionColor(item.actionType)}
          dot={getActionIcon(item.actionType)}
        >
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Text strong className="mr-2">
                  {getActionText(item.actionType)}
                </Text>
                <Tag color={getActionColor(item.actionType)} size="small">
                  {item.actionType}
                </Tag>
              </div>
              <Text type="secondary" className="text-xs">
                {topicHistoryService.formatDateTime(item.updatedAt)}
              </Text>
            </div>
          </div>
          
          <div className="mb-2">
            <Text type="secondary" className="text-sm">
              {item.changedContent}
            </Text>
          </div>

          {showUser && (
            <div className="flex items-center">
              <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
              <Text type="secondary" className="text-xs">
                {item.updatedBy}
              </Text>
            </div>
          )}

          {!topicId && (
            <div className="mt-1">
              <Text type="secondary" className="text-xs">
                Đề tài: {item.topicName}
              </Text>
            </div>
          )}
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default TopicHistoryTimeline;
