import { useState, useEffect, useCallback } from 'react';
import { TopicHistory, TopicHistoryFilters } from '../types/topic-history';
import topicHistoryService from '../services/topicHistoryService';
import { message } from 'antd';

export const useTopicHistory = () => {
  const [topicHistory, setTopicHistory] = useState<TopicHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalChanges: 0,
    createCount: 0,
    updateCount: 0,
    deleteCount: 0,
    uniqueTopics: 0,
    uniqueUsers: [] as string[],
  });

  const loadTopicHistory = useCallback(async (filters?: TopicHistoryFilters) => {
    setLoading(true);
    try {
      const data = await topicHistoryService.getAllTopicHistory(filters);
      setTopicHistory(data);
      
      // Calculate stats
      const uniqueTopics = new Set(data.map(h => h.topicId)).size;
      const uniqueUsers = Array.from(new Set(data.map(h => h.updatedBy)));
      const createCount = data.filter(h => h.actionType === 'CREATE').length;
      const updateCount = data.filter(h => h.actionType === 'UPDATE').length;
      const deleteCount = data.filter(h => h.actionType === 'DELETE').length;
      
      setStats({
        totalChanges: data.length,
        createCount,
        updateCount,
        deleteCount,
        uniqueTopics,
        uniqueUsers,
      });
    } catch (error) {
      console.error('Error loading topic history:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu lịch sử thay đổi');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopicHistory = useCallback(async (topicId: number) => {
    setLoading(true);
    try {
      const data = await topicHistoryService.getTopicHistory(topicId);
      return data;
    } catch (error) {
      console.error('Error loading topic history:', error);
      message.error('Có lỗi xảy ra khi tải lịch sử đề tài');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoryByUser = useCallback(async (username: string) => {
    setLoading(true);
    try {
      const data = await topicHistoryService.getHistoryByUser(username);
      return data;
    } catch (error) {
      console.error('Error loading user history:', error);
      message.error('Có lỗi xảy ra khi tải lịch sử người dùng');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTopicHistory = useCallback(async (historyData: {
    topicId: number;
    changedContent: string;
    updatedBy: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
  }) => {
    try {
      const newHistory = await topicHistoryService.createTopicHistory(historyData);
      setTopicHistory(prev => [newHistory, ...prev]);
      message.success('Đã ghi nhận thay đổi thành công');
      return newHistory;
    } catch (error) {
      console.error('Error creating topic history:', error);
      message.error('Có lỗi xảy ra khi ghi nhận thay đổi');
      throw error;
    }
  }, []);

  const refreshData = useCallback(() => {
    loadTopicHistory();
  }, [loadTopicHistory]);

  useEffect(() => {
    loadTopicHistory();
  }, [loadTopicHistory]);

  return {
    topicHistory,
    loading,
    stats,
    loadTopicHistory,
    getTopicHistory,
    getHistoryByUser,
    createTopicHistory,
    refreshData,
  };
};
