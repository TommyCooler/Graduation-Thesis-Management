package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.responses.*;
import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.TopicApproval;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.repositories.ProgressReviewCouncilRepository;
import mss.project.topicapprovalservice.repositories.TopicApprovalRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.enums.TopicRole;
import mss.project.topicapprovalservice.enums.TopicStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TopicsServiceImpl implements TopicService {

    private static final Logger logger = LoggerFactory.getLogger(TopicsServiceImpl.class);

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private AccountTopicsRepository accountTopicsRepository;

    @Autowired
    private TopicApprovalRepository topicApprovalRepository;

    @Autowired
    private ProgressReviewCouncilRepository progressReviewCouncilRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private CouncilService councilService;

    @Autowired(required = false)
    private PlagiarismService plagiarismService;

    @Autowired
    private S3Service s3Service;

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
        
        // Lưu ID người tạo vào trường createdBy
        if (creatorId != null) {
            topics.setCreatedBy(creatorId.toString());
            logger.info("Setting createdBy for topic: {}", creatorId);
        } else {
            logger.warn("creatorId is null, createdBy will not be set");
        }
        
        Topics savedTopic = topicsRepository.save(topics);
        
        // Log để verify createdBy đã được lưu
        logger.info("Topic created with ID: {}, createdBy: {}, filePathUrl: {}", 
                    savedTopic.getId(), savedTopic.getCreatedBy(), savedTopic.getFilePathUrl());
        
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
    @Transactional
    public AccountTopicsDTOResponse addTopicMember(Long topicId, Long accountId, String accountName) {
        // Kiểm tra topic có tồn tại không
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        // Kiểm tra user đã tham gia topic chưa
        if (accountTopicsRepository.existsByTopicsIdAndAccountId(topicId, accountId)) {
            throw new AppException(ErrorCode.USER_ALREADY_JOINED_TOPIC);
        }
        
        // Tạo AccountTopics cho member với role MEMBER
        AccountTopics memberAccountTopic = new AccountTopics();
        memberAccountTopic.setTopics(topic);
        memberAccountTopic.setAccountId(accountId);
        memberAccountTopic.setAccountName(accountName);
        memberAccountTopic.setRole(TopicRole.MEMBER);
        
        AccountTopics savedMember = accountTopicsRepository.save(memberAccountTopic);
        logger.info("Added member {} to topic {} by admin/creator", accountId, topicId);
        
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
    public List<TopicsWithCouncilIsNullResponse> getTopicsByCouncilNotNull() {
        List<Topics> topics = topicsRepository.findByCouncilIsNullAndStatus(TopicStatus.PASSED_REVIEW_3);

        List<Long> topicIds = topics.stream().map(Topics::getId).toList();
        List<ProgressReviewCouncils> councils = progressReviewCouncilRepository.findAllByTopic_IdInAndMilestone(topicIds, Milestone.WEEK_12);

        Map<Long, LocalDateTime> reviewDateMap = councils.stream()
                .collect(Collectors.toMap(
                        c -> c.getTopic().getId(),
                        ProgressReviewCouncils::getReviewDate
                ));

        return topics.stream()
                .map(topic -> TopicsWithCouncilIsNullResponse.builder()
                        .id(topic.getId())
                        .title(topic.getTitle())
                        .description(topic.getDescription())
                        .submitedAt(String.valueOf(topic.getSubmitedAt()))
                        .status(topic.getStatus().name())
                        .filePathUrl(topic.getFilePathUrl())
                        .createdBy(topic.getCreatedBy())
                        .createdAt(String.valueOf(topic.getCreatedAt()))
                        .updatedAt(String.valueOf(topic.getUpdatedAt()))
                        .reviewDate(reviewDateMap.get(topic.getId()))
                        .build()
                )
                .toList();
    }

    @Transactional
    public void removeTopicMember(Long topicId, Long accountId) {
        // Kiểm tra topic có tồn tại không
        if (!topicsRepository.existsById(topicId)) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        
        // Tìm AccountTopics để xóa
        Optional<AccountTopics> accountTopic = accountTopicsRepository.findByTopicsIdAndAccountId(topicId, accountId);
        
        if (accountTopic.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND_IN_TOPIC);
        }
        
        AccountTopics member = accountTopic.get();
        
        // Không cho xóa CREATOR
        if (member.getRole() == TopicRole.CREATOR) {
            throw new AppException(ErrorCode.CANNOT_REMOVE_CREATOR);
        }
        
        // Xóa thành viên
        accountTopicsRepository.delete(member);
        logger.info("Removed member {} from topic {}", accountId, topicId);
    }

    @Override
    @Transactional
    public TopicsDTOResponse updateTopicStatus(Long topicId, TopicStatus status) {
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));

        if (status == null) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        // Update status
        topic.setStatus(status);
        topicsRepository.save(topic);
        if (topic.getStatus() == TopicStatus.FAILED && topic.getCouncil() != null) {
            councilService.updateRetakeDateForFailedTopic(topic.getCouncil().getId());
        }
        return convertToDTO(topic);
    }

    @Override
    @Transactional
    public TopicsDTOResponse updateTopic(Long Id, TopicsDTORequest topicsDTO) {
        Topics existingTopic = topicsRepository.findById(Id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        // Chỉ update các trường khi chúng không null
        if (topicsDTO.getTitle() != null) {
            existingTopic.setTitle(topicsDTO.getTitle());
        }
        
        if (topicsDTO.getDescription() != null) {
            existingTopic.setDescription(topicsDTO.getDescription());
        }
        
        // Parse status from string to enum
        if (topicsDTO.getStatus() != null && !topicsDTO.getStatus().isEmpty()) {
            try {
                TopicStatus status = TopicStatus.valueOf(topicsDTO.getStatus().toUpperCase());
                existingTopic.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
            }
        }
        
        // Xóa file cũ trên S3 nếu có filePathUrl cũ
        // File mới sẽ được upload thông qua plagiarism check service
        String oldFilePathUrl = existingTopic.getFilePathUrl();
        if (oldFilePathUrl != null && !oldFilePathUrl.isEmpty()) {
            try {
                String oldFileName = s3Service.extractFileNameFromUrl(oldFilePathUrl);
                if (oldFileName != null && !oldFileName.isEmpty()) {
                    s3Service.deleteFile(oldFileName);
                    logger.info("Deleted old file from S3: {} for topic {}", oldFileName, Id);
                } else {
                    logger.warn("Could not extract file name from old filePathUrl: {} for topic {}", oldFilePathUrl, Id);
                }
            } catch (Exception e) {
                logger.error("Failed to delete old file from S3 for topic {}: {}", Id, e.getMessage(), e);
                // Continue with update even if deletion fails
            }
        }
        
        // Luôn update filePathUrl khi có giá trị (kể cả empty string để clear)
        if (topicsDTO.getFilePathUrl() != null) {
            existingTopic.setFilePathUrl(topicsDTO.getFilePathUrl());
            logger.info("Updated topic {} filePathUrl to: {}", Id, topicsDTO.getFilePathUrl());
        }
        
        // Xử lý submitedAt an toàn
        if (topicsDTO.getSubmitedAt() != null && !topicsDTO.getSubmitedAt().isEmpty()) {
            try {
                String dateStr = topicsDTO.getSubmitedAt().replace("Z", "");
                if (dateStr.contains(".")) {
                    dateStr = dateStr.substring(0, dateStr.indexOf("."));
                }
                existingTopic.setSubmitedAt(LocalDateTime.parse(dateStr));
            } catch (Exception e) {
                // Giữ nguyên giá trị hiện có nếu parse lỗi
                logger.warn("Failed to parse submitedAt: {}", topicsDTO.getSubmitedAt());
            }
        }
        
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }

    @Override
    @Transactional
    public void deleteTopic(Long topicId) {
        if (!topicsRepository.existsById(topicId)) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
        
        // Xóa topic khỏi Qdrant (vector database) trước
        try {
            if (plagiarismService != null) {
                plagiarismService.deleteTopicFromQdrant(topicId);
                logger.info("Successfully deleted topic {} from Qdrant", topicId);
            } else {
                logger.warn("PlagiarismService is not available, skipping Qdrant deletion for topic {}", topicId);
            }
        } catch (Exception e) {
            // Log error nhưng vẫn tiếp tục xóa topic (có thể topic không có trong Qdrant)
            logger.warn("Error deleting topic {} from Qdrant (continuing with topic deletion): {}", topicId, e.getMessage());
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
        List<TopicStatus> statusList = Arrays.asList(TopicStatus.APPROVED, TopicStatus.PASSED_REVIEW_1, TopicStatus.PASSED_REVIEW_2, TopicStatus.PASSED_REVIEW_3,TopicStatus.FAILED);
        List<Topics> topicsList = topicsRepository.findByStatusIn(statusList);
        return topicsList.stream().map(topic ->
                GetAllApprovedTopicsResponse.builder()
                        .topicID(topic.getId())
                        .topicTitle(topic.getTitle())
                        .description(topic.getDescription())
                        .topicStatus(topic.getStatus().getDisplayName())
                        .build()).toList();
    }

    @Override
    public List<TopicsDTOResponse> getTopicsByStatus(TopicStatus status) {
        List<Topics> topics = topicsRepository.findByStatus(status);
        return topics.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicsDTOResponse> getTopicsByCreatorId(Long creatorId) {
        if (creatorId == null) {
            logger.warn("getTopicsByCreatorId called with null creatorId");
            return List.of();
        }
        
        logger.info("Finding topics for creatorId: {}", creatorId);
        
        // CHỈ tìm theo createdBy field (chính xác nhất, không bao gồm topics có createdBy = null)
        List<Topics> topicsByCreatedBy = topicsRepository.findByCreatedBy(creatorId.toString());
        logger.info("Found {} topics by createdBy field for creatorId: {}", topicsByCreatedBy.size(), creatorId);
        
        // Log để verify
        if (!topicsByCreatedBy.isEmpty()) {
            List<Long> topicIds = topicsByCreatedBy.stream()
                    .map(Topics::getId)
                    .collect(Collectors.toList());
            logger.info("Topic IDs found by createdBy: {}", topicIds);
            
            // Verify createdBy của từng topic
            for (Topics topic : topicsByCreatedBy) {
                logger.debug("Topic ID: {}, createdBy: {}", topic.getId(), topic.getCreatedBy());
            }
        } else {
            logger.warn("No topics found with createdBy = '{}'", creatorId.toString());
        }
        
        return topicsByCreatedBy.stream()
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
        topicsDTO.setCreatedBy(topics.getCreatedBy());
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
        logger.info("Approving topic {} by user {} ({})", topicId, approverName, approverEmail);
        
        // Find topic
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));

        // Check if already approved by this user
        if (topicApprovalRepository.existsByTopicIdAndApproverEmail(topicId, approverEmail)) {
            logger.warn("Topic {} already approved by user {}", topicId, approverEmail);
            throw new AppException(ErrorCode.TOPIC_ALREADY_APPROVED);
        }

        // Get account info and check if user is creator or member of the topic
        AccountDTO account = accountService.getAccountByEmail(approverEmail);
        if (account != null && accountTopicsRepository.existsByTopicsIdAndAccountIdAndRoleIn(
                topicId, account.getId(), List.of(TopicRole.CREATOR, TopicRole.MEMBER))) {
            logger.warn("User {} is creator or member of topic {}, cannot approve", approverEmail, topicId);
            throw new AppException(ErrorCode.CANNOT_APPROVE_OWN_TOPIC);
        }

        // Create approval record
        TopicApproval approval = TopicApproval.builder()
                .topic(topic)
                .approverEmail(approverEmail)
                .approverName(approverName)
                .comment(comment)
                .build();
        topicApprovalRepository.save(approval);
        logger.info("Saved approval record: topicId={}, approverEmail={}, approverName={}", 
                    topicId, approverEmail, approverName);

        // Update approval count
        topic.setApprovalCount(topic.getApprovalCount() + 1);

        // Update status based on approval count
        if (topic.getApprovalCount() == 1) {
            // First approval - change to UNDER_REVIEW
            topic.setStatus(TopicStatus.UNDER_REVIEW);
            logger.info("Topic {} status changed to UNDER_REVIEW (1/{})", 
                        topicId, topic.getRequiredApprovals());
        } else if (topic.getApprovalCount() >= topic.getRequiredApprovals()) {
            // Fully approved - change to APPROVED
            topic.setStatus(TopicStatus.APPROVED);
            logger.info("Topic {} status changed to APPROVED ({}/{})", 
                        topicId, topic.getApprovalCount(), topic.getRequiredApprovals());
        }

        topicsRepository.save(topic);

        return convertToTopicWithApprovalStatusDTO(topic, approverEmail);
    }

    @Override
    public List<TopicWithApprovalStatusResponse> getPendingTopicsForApproval(String userEmail) {
        // Get account info from email
        AccountDTO account = accountService.getAccountByEmail(userEmail);
        Long accountId = account != null ? account.getId() : null;
        
        // Get all PENDING or UNDER_REVIEW topics
        List<Topics> pendingTopics = topicsRepository.findByStatusIn(
                List.of(TopicStatus.PENDING, TopicStatus.UNDER_REVIEW)
        );

        // Filter out topics:
        // 1. Already approved by this user
        // 2. Created by this user (CREATOR role)
        // 3. User is a member of (MEMBER role)
        return pendingTopics.stream()
                .filter(topic -> {
                    // Kiểm tra đã duyệt chưa
                    if (topicApprovalRepository.existsByTopicIdAndApproverEmail(topic.getId(), userEmail)) {
                        return false;
                    }
                    // Kiểm tra có phải là creator hoặc member không
                    if (accountId != null && accountTopicsRepository.existsByTopicsIdAndAccountIdAndRoleIn(
                            topic.getId(), accountId, List.of(TopicRole.CREATOR, TopicRole.MEMBER))) {
                        logger.debug("User {} is creator or member of topic {}, cannot approve", userEmail, topic.getId());
                        return false;
                    }
                    return true;
                })
                .map(topic -> convertToTopicWithApprovalStatusDTO(topic, userEmail))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicWithApprovalStatusResponse> getApprovedTopicsByUser(String userEmail) {
        logger.info("Getting approved topics for user: {}", userEmail);
        
        // Get all approvals by this user using optimized query
        List<TopicApproval> userApprovals = topicApprovalRepository.findByApproverEmail(userEmail);
        logger.info("Found {} approval records for user {}", userApprovals.size(), userEmail);

        // Get all topics that user has approved
        List<TopicWithApprovalStatusResponse> result = userApprovals.stream()
                .map(approval -> {
                    Topics topic = approval.getTopic();
                    logger.debug("Processing topic: id={}, title={}, status={}", 
                                topic.getId(), topic.getTitle(), topic.getStatus());
                    
                    // Only return topics that are still in review process or approved
                    // Exclude rejected topics
                    if (topic.getStatus() == TopicStatus.UNDER_REVIEW || 
                        topic.getStatus() == TopicStatus.APPROVED) {
                        return convertToTopicWithApprovalStatusDTO(topic, userEmail);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .distinct() // Remove duplicates if any
                .collect(Collectors.toList());
        
        logger.info("Returning {} approved topics for user {}", result.size(), userEmail);
        return result;
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

    @Override
    public boolean canUserEditTopic(Long topicId, Long accountId) {
        if (accountId == null) {
            return false;
        }
        // User can edit if they are creator or member of the topic
        return accountTopicsRepository.existsByTopicsIdAndAccountIdAndRoleIn(
                topicId, accountId, List.of(TopicRole.CREATOR, TopicRole.MEMBER));
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
                .createdBy(topic.getCreatedBy())
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
