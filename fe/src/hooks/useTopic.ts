import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { 
  Topic, 
  TopicFilters, 
  TopicStats, 
  TopicCreateRequest, 
  TopicUpdateRequest,
  TopicPagination
} from '../types/topic';
import { topicService } from '../services/topicService';

interface UseTopicReturn {
  // Data
  topics: Topic[];
  currentTopic: Topic | null;
  stats: TopicStats | null;
  pagination: TopicPagination | null;
  
  // Loading states
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  submitLoading: boolean;
    // Actions
  fetchTopics: (filters?: TopicFilters, page?: number, size?: number) => Promise<void>;
  fetchTopicById: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createTopic: (data: TopicCreateRequest) => Promise<Topic | null>;
  createTopicWithSubmission: (data: TopicCreateRequest) => Promise<Topic | null>;
  updateTopic: (id: number, data: TopicUpdateRequest) => Promise<Topic | null>;
  deleteTopic: (id: number) => Promise<boolean>;
  submitTopic: (id: number) => Promise<Topic | null>;
  approveTopic: (id: number) => Promise<Topic | null>;
  rejectTopic: (id: number, reason?: string) => Promise<Topic | null>;
  uploadFile: (id: number, file: File) => Promise<string | null>;
  
  // Utilities
  refreshTopics: () => Promise<void>;
  clearCurrentTopic: () => void;
}

export const useTopic = (): UseTopicReturn => {
  // State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [stats, setStats] = useState<TopicStats | null>(null);
  const [pagination, setPagination] = useState<TopicPagination | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Current filters for refresh
  const [currentFilters, setCurrentFilters] = useState<TopicFilters | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSize, setCurrentSize] = useState(10);

  /**
   * Fetch all topics with pagination and filters
   */
  const fetchTopics = useCallback(async (
    filters?: TopicFilters, 
    page: number = 0, 
    size: number = 10
  ) => {
    setLoading(true);
    try {
      const result = await topicService.getAllTopics(filters, page, size);
      setTopics(result.topics);
      setPagination(result.pagination);
      
      // Store current params for refresh
      setCurrentFilters(filters);
      setCurrentPage(page);
      setCurrentSize(size);
    } catch (error) {
      message.error('Không thể tải danh sách đề tài');
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch topic by ID
   */
  const fetchTopicById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const topic = await topicService.getTopicById(id);
      setCurrentTopic(topic);
    } catch (error) {
      message.error('Không thể tải thông tin đề tài');
      console.error('Error fetching topic by ID:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await topicService.getTopicStats();
      setStats(statsData);
    } catch (error) {
      message.error('Không thể tải thống kê đề tài');
      console.error('Error fetching stats:', error);
    }
  }, []);

  /**
   * Create new topic
   */
  const createTopic = useCallback(async (data: TopicCreateRequest): Promise<Topic | null> => {
    setCreateLoading(true);
    try {
      const newTopic = await topicService.createTopic(data);
      message.success('Tạo đề tài thành công');
      
      // Refresh topics list
      await refreshTopics();
      
      return newTopic;
    } catch (error) {
      message.error('Không thể tạo đề tài');
      console.error('Error creating topic:', error);
      return null;
    } finally {
      setCreateLoading(false);
    }
  }, []);

  /**
   * Create new topic with submission details
   */
  const createTopicWithSubmission = useCallback(async (data: TopicCreateRequest): Promise<Topic | null> => {
    setCreateLoading(true);
    try {
      const newTopic = await topicService.createTopicWithSubmission(data);
      message.success('Tạo và nộp đề tài thành công');
      
      // Refresh topics list
      await refreshTopics();
      
      return newTopic;
    } catch (error) {
      message.error('Không thể tạo đề tài');
      console.error('Error creating topic with submission:', error);
      return null;
    } finally {
      setCreateLoading(false);
    }
  }, []);

  /**
   * Update topic
   */
  const updateTopic = useCallback(async (id: number, data: TopicUpdateRequest): Promise<Topic | null> => {
    setUpdateLoading(true);
    try {
      const updatedTopic = await topicService.updateTopic(id, data);
      message.success('Cập nhật đề tài thành công');
      
      // Update in current list
      setTopics(prev => prev.map(topic => 
        topic.id === id ? updatedTopic : topic
      ));
      
      // Update current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(updatedTopic);
      }
      
      return updatedTopic;
    } catch (error) {
      message.error('Không thể cập nhật đề tài');
      console.error('Error updating topic:', error);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  }, [currentTopic]);

  /**
   * Delete topic
   */
  const deleteTopic = useCallback(async (id: number): Promise<boolean> => {
    setDeleteLoading(true);
    try {
      await topicService.deleteTopic(id);
      message.success('Xóa đề tài thành công');
      
      // Remove from current list
      setTopics(prev => prev.filter(topic => topic.id !== id));
      
      // Clear current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(null);
      }
      
      return true;
    } catch (error) {
      message.error('Không thể xóa đề tài');
      console.error('Error deleting topic:', error);
      return false;
    } finally {
      setDeleteLoading(false);
    }
  }, [currentTopic]);

  /**
   * Submit topic
   */
  const submitTopic = useCallback(async (id: number): Promise<Topic | null> => {
    setSubmitLoading(true);
    try {
      const submittedTopic = await topicService.submitTopic(id);
      message.success('Nộp đề tài thành công');
      
      // Update in current list
      setTopics(prev => prev.map(topic => 
        topic.id === id ? submittedTopic : topic
      ));
      
      // Update current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(submittedTopic);
      }
      
      return submittedTopic;
    } catch (error) {
      message.error('Không thể nộp đề tài');
      console.error('Error submitting topic:', error);
      return null;
    } finally {
      setSubmitLoading(false);
    }
  }, [currentTopic]);

  /**
   * Approve topic
   */
  const approveTopic = useCallback(async (id: number): Promise<Topic | null> => {
    setUpdateLoading(true);
    try {
      const approvedTopic = await topicService.approveTopic(id);
      message.success('Phê duyệt đề tài thành công');
      
      // Update in current list
      setTopics(prev => prev.map(topic => 
        topic.id === id ? approvedTopic : topic
      ));
      
      // Update current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(approvedTopic);
      }
      
      return approvedTopic;
    } catch (error) {
      message.error('Không thể phê duyệt đề tài');
      console.error('Error approving topic:', error);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  }, [currentTopic]);

  /**
   * Reject topic
   */
  const rejectTopic = useCallback(async (id: number, reason?: string): Promise<Topic | null> => {
    setUpdateLoading(true);
    try {
      const rejectedTopic = await topicService.rejectTopic(id, reason);
      message.success('Từ chối đề tài thành công');
      
      // Update in current list
      setTopics(prev => prev.map(topic => 
        topic.id === id ? rejectedTopic : topic
      ));
      
      // Update current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(rejectedTopic);
      }
      
      return rejectedTopic;
    } catch (error) {
      message.error('Không thể từ chối đề tài');
      console.error('Error rejecting topic:', error);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  }, [currentTopic]);

  /**
   * Upload file for topic
   */
  const uploadFile = useCallback(async (id: number, file: File): Promise<string | null> => {
    try {
      const fileUrl = await topicService.uploadTopicFile(id, file);
      message.success('Tải file thành công');
      
      // Refresh the topic to get updated file URL
      await fetchTopicById(id);
      
      return fileUrl;
    } catch (error) {
      message.error('Không thể tải file');
      console.error('Error uploading file:', error);
      return null;
    }
  }, [fetchTopicById]);

  /**
   * Refresh topics with current filters
   */
  const refreshTopics = useCallback(async () => {
    await fetchTopics(currentFilters, currentPage, currentSize);
  }, [fetchTopics, currentFilters, currentPage, currentSize]);

  /**
   * Clear current topic
   */
  const clearCurrentTopic = useCallback(() => {
    setCurrentTopic(null);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchTopics();
    fetchStats();
  }, [fetchTopics, fetchStats]);

  return {
    // Data
    topics,
    currentTopic,
    stats,
    pagination,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    submitLoading,
    
    // Actions
    fetchTopics,
    fetchTopicById,
    fetchStats,
    createTopic,
    createTopicWithSubmission,
    updateTopic,
    deleteTopic,
    submitTopic,
    approveTopic,
    rejectTopic,
    uploadFile,
    
    // Utilities
    refreshTopics,
    clearCurrentTopic,
  };
};

export default useTopic;
