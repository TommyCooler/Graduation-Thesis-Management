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
import { plagiarismService } from '../services/plagiarismService';

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
  createTopic: (data: TopicCreateRequest) => Promise<Topic | null>;
  createTopicWithFile: (data: TopicCreateRequest, file: File) => Promise<Topic | null>;
  createTopicWithSubmission: (data: TopicCreateRequest) => Promise<Topic | null>;
  updateTopic: (id: number, data: TopicUpdateRequest) => Promise<Topic | null>;
  updateTopicWithFile: (id: number, data: TopicUpdateRequest, file: File) => Promise<Topic | null>;
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
   * Create new topic
   */
  const createTopic = useCallback(async (data: TopicCreateRequest): Promise<Topic | null> => {
    setCreateLoading(true);
    try {
      const newTopic = await topicService.createTopic(data);
      message.success('Tạo đề tài thành công');
      
      // Refresh topics list after successful creation
      try {
        await refreshTopics();
      } catch (refreshError) {
        console.warn('Could not refresh topics list:', refreshError);
        // Don't throw error if refresh fails
      }
      
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
   * Create new topic with file upload
   */
  const createTopicWithFile = useCallback(async (data: TopicCreateRequest, file: File): Promise<Topic | null> => {
    setCreateLoading(true);
    try {
      const newTopic = await topicService.createTopicWithFile(data, file);
      message.success('Tạo đề tài và upload file thành công');
      
      // Refresh topics list after successful creation
      try {
        await refreshTopics();
      } catch (refreshError) {
        console.warn('Could not refresh topics list:', refreshError);
      }
      
      return newTopic;
    } catch (error: any) {
      message.error(error.message || 'Không thể tạo đề tài với file');
      console.error('Error creating topic with file:', error);
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
   * Update topic with file upload
   */
  const updateTopicWithFile = useCallback(async (id: number, data: TopicUpdateRequest, file: File): Promise<Topic | null> => {
    setUpdateLoading(true);
    const deleteLoadingMsg = message.loading('Đang xóa dữ liệu cũ từ Qdrant...', 0);
    
    // Lưu dữ liệu cũ để rollback nếu cần
    let originalTopic: Topic | null = null;
    try {
      originalTopic = await topicService.getTopicById(id);
    } catch (err) {
      console.warn('Could not fetch original topic for rollback:', err);
    }
    
    try {
      // Bước 1: Xóa topic khỏi Qdrant trước - BẮT BUỘC phải thành công
      try {
        await plagiarismService.deleteTopicFromQdrant(id);
        deleteLoadingMsg();
        console.log('Successfully deleted topic from Qdrant');
      } catch (deleteError: any) {
        deleteLoadingMsg();
        const errorMessage = deleteError.message || 'Không thể xóa dữ liệu cũ từ Qdrant';
        message.error(`Xóa dữ liệu cũ thất bại: ${errorMessage}. Đề tài không được cập nhật.`);
        console.error('Error deleting topic from Qdrant:', deleteError);
        throw new Error(`Xóa dữ liệu cũ thất bại: ${errorMessage}`);
      }

      // Bước 2: Update topic với file
      const updatedTopic = await topicService.updateTopicWithFile(id, data, file);
      
      // Update in current list
      setTopics(prev => prev.map(topic => 
        topic.id === id ? updatedTopic : topic
      ));
      
      // Update current topic if it's the same
      if (currentTopic?.id === id) {
        setCurrentTopic(updatedTopic);
      }

      // Bước 3: Gọi check plagiarism với file mới - BẮT BUỘC phải thành công
      const plagiarismLoadingMsg = message.loading('Đang kiểm tra đạo văn...', 0);
      try {
        await plagiarismService.checkPlagiarism(file, id);
        plagiarismLoadingMsg();
        message.success('Cập nhật đề tài và kiểm tra đạo văn thành công');
        console.log('Successfully started plagiarism check');
      } catch (plagiarismError: any) {
        plagiarismLoadingMsg();
        const errorMessage = plagiarismError.message || 'Không thể kiểm tra đạo văn';
        console.error('Error checking plagiarism:', plagiarismError);
        
        // Rollback: Khôi phục topic về trạng thái cũ
        if (originalTopic) {
          try {
            message.loading('Đang khôi phục đề tài về trạng thái cũ...', 0);
            const rollbackData: TopicUpdateRequest = {
              title: originalTopic.title,
              description: originalTopic.description,
              filePathUrl: originalTopic.filePathUrl || undefined,
            };
            await topicService.updateTopic(id, rollbackData);
            message.destroy();
            
            // Reload topic để đảm bảo dữ liệu đồng bộ
            await fetchTopicById(id);
            
            console.log('Successfully rolled back topic to original state');
          } catch (rollbackError: any) {
            message.destroy();
            console.error('Error rolling back topic:', rollbackError);
            message.error('Kiểm tra đạo văn thất bại và không thể khôi phục đề tài. Vui lòng liên hệ quản trị viên.');
          }
        } else {
          // Nếu không có dữ liệu cũ, reload từ server
          try {
            await fetchTopicById(id);
          } catch (reloadError) {
            console.error('Error reloading topic after plagiarism check failure:', reloadError);
          }
        }
        
        message.error(`Kiểm tra đạo văn thất bại: ${errorMessage}. Đề tài không được cập nhật.`);
        throw new Error(`Kiểm tra đạo văn thất bại: ${errorMessage}`);
      }
      
      return updatedTopic;
    } catch (error: any) {
      // Nếu là lỗi từ delete hoặc plagiarism check, đã có message rồi
      if (!error.message?.includes('Xóa dữ liệu cũ thất bại') && 
          !error.message?.includes('Kiểm tra đạo văn thất bại')) {
        message.error(error.message || 'Không thể cập nhật đề tài với file');
      }
      console.error('Error updating topic with file:', error);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  }, [currentTopic, fetchTopicById]);

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
    } catch (error: any) {
      message.error(error.message || 'Không thể xóa đề tài');
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

  // Load initial data on component mount
  useEffect(() => {
    // Silently load data, don't show errors to user
    fetchTopics().catch(err => console.warn('Initial topics load failed:', err));
  }, [fetchTopics]);

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
    createTopic,
    createTopicWithFile,
    createTopicWithSubmission,
    updateTopic,
    updateTopicWithFile,
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
