package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.responses.TopicApprovalDTOResponse;
import mss.project.topicapprovalservice.dtos.TopicWithApprovalStatusResponse;
import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.dtos.responses.AccountTopicsDTOResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.TopicApproval;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.repositories.TopicApprovalRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.enums.TopicRole;
import mss.project.topicapprovalservice.enums.TopicStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicsServiceImpl implements TopicService {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private AccountTopicsRepository accountTopicsRepository;

    @Autowired
    private TopicApprovalRepository topicApprovalRepository;

    @Override
    public TopicsDTOResponse getTopicbById(Long topicId) {
        Topics topics = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        return convertToDTO(topics);
    }

    @Override
    @Transactional
    public TopicsDTOResponse createTopic(TopicsDTORequest topicsDTO, Long creatorId, String creatorName) {
        // Tạo và lưu topic
        Topics topics = convertToEntity(topicsDTO);
        Topics savedTopic = topicsRepository.save(topics);
        
        // Tạo AccountTopics cho người tạo với role CREATOR
        AccountTopics creatorAccountTopic = new AccountTopics();
        creatorAccountTopic.setTopics(savedTopic);
        creatorAccountTopic.setAccountId(creatorId);
        creatorAccountTopic.setAccountName(creatorName);
        creatorAccountTopic.setRole(TopicRole.CREATOR);
        
        accountTopicsRepository.save(creatorAccountTopic);
        
        return convertToDTO(savedTopic);
    }

    @Override
    @Transactional
    public AccountTopicsDTOResponse joinTopic(Long topicId, Long memberId, String memberName) {
        // Kiểm tra topic có tồn tại không
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        // Kiểm tra user đã tham gia topic chưa
        if (accountTopicsRepository.existsByTopicsIdAndAccountId(topicId, memberId)) {
            throw new AppException(ErrorCode.USER_ALREADY_JOINED_TOPIC);
        }
        
        // Tạo AccountTopics cho member với role MEMBER
        AccountTopics memberAccountTopic = new AccountTopics();
        memberAccountTopic.setTopics(topic);
        memberAccountTopic.setAccountId(memberId);
        memberAccountTopic.setAccountName(memberName);
        memberAccountTopic.setRole(TopicRole.MEMBER);
        
        AccountTopics savedMember = accountTopicsRepository.save(memberAccountTopic);
        
        return convertAccountTopicToDTO(savedMember);
    }

    @Override
    public List<AccountTopicsDTOResponse> getTopicMembers(Long topicId) {
        // Kiểm tra topic có tồn tại không
        if (!topicsRepository.existsById(topicId)) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        
        List<AccountTopics> members = accountTopicsRepository.findByTopicsId(topicId);
        return members.stream()
                .map(this::convertAccountTopicToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TopicsDTOResponse updateTopic(Long Id, TopicsDTORequest topicsDTO) {
        Topics existingTopic = topicsRepository.findById(Id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        existingTopic.setTitle(topicsDTO.getTitle());
        existingTopic.setDescription(topicsDTO.getDescription());
        
        // Parse status from string to enum
        if (topicsDTO.getStatus() != null && !topicsDTO.getStatus().isEmpty()) {
            try {
                TopicStatus status = TopicStatus.valueOf(topicsDTO.getStatus().toUpperCase());
                existingTopic.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
            }
        }
        
        existingTopic.setFilePathUrl(topicsDTO.getFilePathUrl());
        existingTopic.setSubmitedAt(LocalDateTime.parse(topicsDTO.getSubmitedAt()));
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }

    @Override
    @Transactional
    public void deleteTopic(Long topicId) {
        if (!topicsRepository.existsById(topicId)) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        // Xóa tất cả AccountTopics liên quan trước
        accountTopicsRepository.deleteByTopicsId(topicId);
        // Sau đó xóa topic
        topicsRepository.deleteById(topicId);
    }

    @Override
    public List<TopicsDTOResponse> getAllTopics() {
        List<Topics> topics = topicsRepository.findAll();
        if (!topics.isEmpty()) {
            return topics.stream().map(this::convertToDTO).toList();
        }
        return null;
    }

    @Override
    public TopicsDTOResponse approveTopic(Long topicId, String email) {
        authorizationService.checkHeadOfDepartmentPermission(email);
        
        Topics existingTopic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        if (existingTopic.getStatus() != TopicStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        
        existingTopic.setStatus(TopicStatus.APPROVED);
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }
    
    @Override
    public TopicsDTOResponse rejectTopic(Long topicId, String email) {
        authorizationService.checkHeadOfDepartmentPermission(email);
        
        Topics existingTopic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        if (existingTopic.getStatus() != TopicStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        
        existingTopic.setStatus(TopicStatus.REJECTED);
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }

    @Override
    public List<GetAllApprovedTopicsResponse> getApprovedTopics() {
        List<Topics> topicsList = topicsRepository.findByStatus(TopicStatus.APPROVED);
        return topicsList.stream().map(topic ->
                GetAllApprovedTopicsResponse.builder()
                        .topicID(topic.getId())
                        .topicTitle(topic.getTitle())
                        .description(topic.getDescription())
                        .build()).toList();
    }

    @Override
    public List<TopicsDTOResponse> getTopicsByStatus(TopicStatus status) {
        List<Topics> topics = topicsRepository.findByStatus(status);
        return topics.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Topics convertToEntity(TopicsDTORequest topicsDTO){
        Topics topics = new Topics();
        topics.setTitle(topicsDTO.getTitle());
        topics.setDescription(topicsDTO.getDescription());
        
        if (topicsDTO.getSubmitedAt() != null && !topicsDTO.getSubmitedAt().isEmpty()) {
            try {
                String dateStr = topicsDTO.getSubmitedAt().replace("Z", "");
                if (dateStr.contains(".")) {
                    dateStr = dateStr.substring(0, dateStr.indexOf("."));
                }
                topics.setSubmitedAt(LocalDateTime.parse(dateStr));
            } catch (Exception e) {
                topics.setSubmitedAt(LocalDateTime.now());
            }
        } else {
            topics.setSubmitedAt(LocalDateTime.now());
        }
        
        // Parse status from string to enum
        TopicStatus status = TopicStatus.PENDING; // default
        if (topicsDTO.getStatus() != null && !topicsDTO.getStatus().isEmpty()) {
            try {
                status = TopicStatus.valueOf(topicsDTO.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                // If invalid status, default to PENDING
                status = TopicStatus.PENDING;
            }
        }
        topics.setStatus(status);
        topics.setFilePathUrl(topicsDTO.getFilePathUrl());
        return topics;
    }

    private TopicsDTOResponse convertToDTO(Topics topics){
        TopicsDTOResponse topicsDTO = new TopicsDTOResponse();
        topicsDTO.setId(topics.getId());
        topicsDTO.setTitle(topics.getTitle());
        topicsDTO.setDescription(topics.getDescription());
        topicsDTO.setSubmitedAt(topics.getSubmitedAt() != null ? topics.getSubmitedAt().toString() : null);
        topicsDTO.setStatus(topics.getStatus() != null ? topics.getStatus().name() : null);
        topicsDTO.setFilePathUrl(topics.getFilePathUrl());
        topicsDTO.setCreatedAt(topics.getCreatedAt() != null ? topics.getCreatedAt().toString() : null);
        topicsDTO.setUpdatedAt(topics.getUpdatedAt() != null ? topics.getUpdatedAt().toString() : null);
        return topicsDTO;
    }

    private AccountTopicsDTOResponse convertAccountTopicToDTO(AccountTopics accountTopics) {
        AccountTopicsDTOResponse dto = new AccountTopicsDTOResponse();
        dto.setId(accountTopics.getId());
        dto.setTopicId(accountTopics.getTopics().getId());
        dto.setAccountId(accountTopics.getAccountId());
        dto.setAccountName(accountTopics.getAccountName());
        dto.setRole(accountTopics.getRole().name());
        return dto;
    }

    // ========== 2-Person Approval Workflow Methods ==========

    @Override
    @Transactional
    public TopicWithApprovalStatusResponse approveTopicV2(Long topicId, String approverEmail, String approverName, String comment) {
        // Find topic
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));

        // Check if already approved by this user
        if (topicApprovalRepository.existsByTopicIdAndApproverEmail(topicId, approverEmail)) {
            throw new AppException(ErrorCode.TOPIC_ALREADY_APPROVED);
        }

        // Create approval record
        TopicApproval approval = TopicApproval.builder()
                .topic(topic)
                .approverEmail(approverEmail)
                .approverName(approverName)
                .comment(comment)
                .build();
        topicApprovalRepository.save(approval);

        // Update approval count
        topic.setApprovalCount(topic.getApprovalCount() + 1);

        // Update status based on approval count
        if (topic.getApprovalCount() == 1) {
            // First approval - change to UNDER_REVIEW
            topic.setStatus(TopicStatus.UNDER_REVIEW);
        } else if (topic.getApprovalCount() >= topic.getRequiredApprovals()) {
            // Fully approved - change to APPROVED
            topic.setStatus(TopicStatus.APPROVED);
        }

        topicsRepository.save(topic);

        return convertToTopicWithApprovalStatusDTO(topic, approverEmail);
    }

    @Override
    public List<TopicWithApprovalStatusResponse> getPendingTopicsForApproval(String userEmail) {
        // Get all PENDING or UNDER_REVIEW topics
        List<Topics> pendingTopics = topicsRepository.findByStatusIn(
                List.of(TopicStatus.PENDING, TopicStatus.UNDER_REVIEW)
        );

        // Filter out topics already approved by this user
        return pendingTopics.stream()
                .filter(topic -> !topicApprovalRepository.existsByTopicIdAndApproverEmail(topic.getId(), userEmail))
                .map(topic -> convertToTopicWithApprovalStatusDTO(topic, userEmail))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicWithApprovalStatusResponse> getApprovedTopicsByUser(String userEmail) {
        // Get all UNDER_REVIEW topics (partially approved)
        List<Topics> underReviewTopics = topicsRepository.findByStatus(TopicStatus.UNDER_REVIEW);

        // Filter topics approved by this user
        return underReviewTopics.stream()
                .filter(topic -> topicApprovalRepository.existsByTopicIdAndApproverEmail(topic.getId(), userEmail))
                .map(topic -> convertToTopicWithApprovalStatusDTO(topic, userEmail))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicWithApprovalStatusResponse> getFullyApprovedTopics() {
        // Get all APPROVED topics
        List<Topics> approvedTopics = topicsRepository.findByStatus(TopicStatus.APPROVED);

        // Filter topics with approval count >= required approvals
        return approvedTopics.stream()
                .filter(topic -> topic.getApprovalCount() >= topic.getRequiredApprovals())
                .map(topic -> convertToTopicWithApprovalStatusDTO(topic, null))
                .collect(Collectors.toList());
    }

    private TopicWithApprovalStatusResponse convertToTopicWithApprovalStatusDTO(Topics topic, String userEmail) {
        // Get all approvals for this topic
        List<TopicApproval> approvals = topicApprovalRepository.findByTopicId(topic.getId());
        
        List<TopicApprovalDTOResponse> approvalDTOs = approvals.stream()
                .map(approval -> TopicApprovalDTOResponse.builder()
                        .id(approval.getId())
                        .topicId(topic.getId())
                        .approverEmail(approval.getApproverEmail())
                        .approverName(approval.getApproverName())
                        .approvedAt(approval.getApprovedAt())
                        .comment(approval.getComment())
                        .build())
                .collect(Collectors.toList());

        // Check if user has approved
        boolean hasUserApproved = userEmail != null && 
                topicApprovalRepository.existsByTopicIdAndApproverEmail(topic.getId(), userEmail);

        // Create approval status string
        String approvalStatus = topic.getApprovalCount() + "/" + topic.getRequiredApprovals();

        return TopicWithApprovalStatusResponse.topicWithApprovalBuilder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .submitedAt(topic.getSubmitedAt() != null ? topic.getSubmitedAt().toString() : null)
                .status(topic.getStatus() != null ? topic.getStatus().name() : null)
                .filePathUrl(topic.getFilePathUrl())
                .createdAt(topic.getCreatedAt() != null ? topic.getCreatedAt().toString() : null)
                .updatedAt(topic.getUpdatedAt() != null ? topic.getUpdatedAt().toString() : null)
                .approvalCount(topic.getApprovalCount())
                .requiredApprovals(topic.getRequiredApprovals())
                .approvalStatus(approvalStatus)
                .hasUserApproved(hasUserApproved)
                .approvals(approvalDTOs)
                .build();
    }
}
