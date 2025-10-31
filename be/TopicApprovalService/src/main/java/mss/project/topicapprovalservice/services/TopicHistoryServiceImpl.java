package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.TopicHistoryDTOResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.TopicHistory;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.TopicHistoryRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicHistoryServiceImpl implements TopicHistoryService {

    private static final Logger log = LoggerFactory.getLogger(TopicHistoryServiceImpl.class);

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private TopicHistoryRepository topicHistoryRepository;
    
    @Override
    @Transactional
    public void recordTopicChange(Topics topic, String changedContent, String updatedBy, String actionType) {
        TopicHistory history = new TopicHistory();
        history.setTopic(topic);
        history.setChangedContent(changedContent);
        history.setUpdatedBy(updatedBy);
        history.setUpdatedAt(LocalDateTime.now());
        history.setActionType(actionType);
        
        topicHistoryRepository.save(history);
    }
    
    @Override
    public List<TopicHistoryDTOResponse> getTopicHistory(Long topicId) {
        List<TopicHistory> histories = topicHistoryRepository.findByTopicIdOrderByUpdatedAtDesc(topicId);
        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TopicHistoryDTOResponse> getHistoryByUser(String username) {
        List<TopicHistory> histories = topicHistoryRepository.findByUpdatedByOrderByUpdatedAtDesc(username);
        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<TopicHistoryDTOResponse> getAllTopicHistory() {
        List<TopicHistory> histories = topicHistoryRepository.findAllByOrderByUpdatedAtDesc();
        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private TopicHistoryDTOResponse convertToDTO(TopicHistory history) {
        TopicHistoryDTOResponse dto = new TopicHistoryDTOResponse();
        dto.setId(history.getId());
        dto.setTopicId(history.getTopic().getId());
        dto.setTopicName(history.getTopic().getTitle());
        dto.setChangedContent(history.getChangedContent());
        dto.setUpdatedBy(history.getUpdatedBy());
        dto.setUpdatedAt(history.getUpdatedAt());
        dto.setActionType(history.getActionType());
        return dto;
    }

    @Override
    public Topics updateTopic(Long id, TopicsDTORequest request, String username) {
        Topics topic = topicsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        // Validate input
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        
        // Ghi nhận các thay đổi chi tiết
        List<String> changes = new ArrayList<>();
        
        // Kiểm tra tên
        if (!Objects.equals(topic.getTitle(), request.getTitle())) {
            changes.add(String.format("Tên đề tài: '%s' -> '%s'", 
                topic.getTitle(), request.getTitle()));
        }
        
        // Kiểm tra mô tả
        if (!Objects.equals(topic.getDescription(), request.getDescription())) {
            changes.add("Mô tả đề tài đã được cập nhật");
        }
        
        // Cập nhật topic (chỉ cập nhật title và description, giữ nguyên status)
        topic.setTitle(request.getTitle());
        topic.setDescription(request.getDescription());
        // Không cập nhật status - giữ nguyên trạng thái hiện tại
        
        Topics savedTopic = topicsRepository.save(topic);
        
        // Lưu lịch sử thay đổi nếu có thay đổi
        if (!changes.isEmpty()) {
            String changedContent = String.join("; ", changes);
            try {
                this.recordTopicChange(
                    savedTopic, 
                    changedContent, 
                    username, 
                    "UPDATE"
                );
            } catch (Exception e) {
                // Log error nhưng không fail transaction
                log.error("Failed to record topic history for topic {}: {}", 
                    savedTopic.getId(), e.getMessage());
            }
        }
        
        return savedTopic;
    }
}