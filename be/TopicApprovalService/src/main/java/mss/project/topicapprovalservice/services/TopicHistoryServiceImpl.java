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
    
    @Autowired
    private S3Service s3Service;
    
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
        
        // Nếu topic đang ở trạng thái REJECTED, tự động reset về PENDING khi cập nhật
        boolean wasRejected = topic.getStatus() == mss.project.topicapprovalservice.enums.TopicStatus.REJECTED;
        
        // Ghi nhận các thay đổi chi tiết
        List<String> changes = new ArrayList<>();
        
        // Kiểm tra tên
        if (!Objects.equals(topic.getTitle(), request.getTitle())) {
            changes.add(String.format("Tên đề tài: '%s' -> '%s'", 
                topic.getTitle(), request.getTitle()));
            topic.setTitle(request.getTitle());
        }
        
        // Kiểm tra mô tả
        if (!Objects.equals(topic.getDescription(), request.getDescription())) {
            changes.add("Mô tả đề tài đã được cập nhật");
            topic.setDescription(request.getDescription());
        }
        
        // Kiểm tra filePathUrl
        if (!Objects.equals(topic.getFilePathUrl(), request.getFilePathUrl())) {
            // Xóa file cũ trên S3 nếu có filePathUrl cũ (khi thay đổi file hoặc xóa file)
            String oldFilePathUrl = topic.getFilePathUrl();
            if (oldFilePathUrl != null && !oldFilePathUrl.isEmpty()) {
                try {
                    String oldFileName = s3Service.extractFileNameFromUrl(oldFilePathUrl);
                    if (oldFileName != null && !oldFileName.isEmpty()) {
                        s3Service.deleteFile(oldFileName);
                        log.info("Deleted old file from S3: {} for topic {}", oldFileName, id);
                    } else {
                        log.warn("Could not extract file name from old filePathUrl: {} for topic {}", oldFilePathUrl, id);
                    }
                } catch (Exception e) {
                    log.error("Failed to delete old file from S3 for topic {}: {}", id, e.getMessage(), e);
                    // Continue with update even if deletion fails
                }
            }
            
            changes.add(String.format("Đường dẫn file: '%s' -> '%s'", 
                topic.getFilePathUrl() != null ? topic.getFilePathUrl() : "(trống)", 
                request.getFilePathUrl() != null ? request.getFilePathUrl() : "(trống)"));
            topic.setFilePathUrl(request.getFilePathUrl() != null ? request.getFilePathUrl() : topic.getFilePathUrl());
        }
        
        // Kiểm tra status nếu có
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                mss.project.topicapprovalservice.enums.TopicStatus newStatus = 
                    mss.project.topicapprovalservice.enums.TopicStatus.valueOf(request.getStatus().toUpperCase());
                if (topic.getStatus() != newStatus) {
                    changes.add(String.format("Trạng thái: '%s' -> '%s'", 
                        topic.getStatus(), newStatus));
                    topic.setStatus(newStatus);
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", request.getStatus());
            }
        } else if (wasRejected) {
            // Tự động reset về PENDING nếu đang REJECTED và không có status mới được chỉ định
            // Để đề tài có thể được duyệt lại
            topic.setStatus(mss.project.topicapprovalservice.enums.TopicStatus.PENDING);
            topic.setApprovalCount(0); // Reset approval count
            changes.add(String.format("Trạng thái: '%s' -> '%s' (tự động reset sau khi cập nhật)", 
                mss.project.topicapprovalservice.enums.TopicStatus.REJECTED, 
                mss.project.topicapprovalservice.enums.TopicStatus.PENDING));
            log.info("Topic {} status reset from REJECTED to PENDING after update", id);
        }
        
        // Kiểm tra submitedAt nếu có
        if (request.getSubmitedAt() != null && !request.getSubmitedAt().isEmpty()) {
            try {
                String dateStr = request.getSubmitedAt().replace("Z", "");
                if (dateStr.contains(".")) {
                    dateStr = dateStr.substring(0, dateStr.indexOf("."));
                }
                LocalDateTime newSubmitedAt = LocalDateTime.parse(dateStr);
                if (!Objects.equals(topic.getSubmitedAt(), newSubmitedAt)) {
                    changes.add("Ngày nộp đã được cập nhật");
                    topic.setSubmitedAt(newSubmitedAt);
                }
            } catch (Exception e) {
                log.warn("Failed to parse submitedAt: {}", request.getSubmitedAt());
            }
        }
        
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