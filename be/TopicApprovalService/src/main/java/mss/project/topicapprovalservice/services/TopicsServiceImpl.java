package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.dtos.responses.AccountTopicsDTOResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.enums.TopicRole;
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
        existingTopic.setStatus(topicsDTO.getStatus());
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
        
        if (!"PENDING".equals(existingTopic.getStatus())) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        
        existingTopic.setStatus("APPROVED");
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }
    
    @Override
    public TopicsDTOResponse rejectTopic(Long topicId, String email) {
        authorizationService.checkHeadOfDepartmentPermission(email);
        
        Topics existingTopic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        
        if (!"PENDING".equals(existingTopic.getStatus())) {
            throw new AppException(ErrorCode.INVALID_TOPIC_STATUS);
        }
        
        existingTopic.setStatus("REJECTED");
        topicsRepository.save(existingTopic);
        return convertToDTO(existingTopic);
    }

    @Override
    public List<GetAllApprovedTopicsResponse> getApprovedTopics() {
        List<Topics> topicsList = topicsRepository.findByStatus("APPROVED");
        return topicsList.stream().map(topic ->
                GetAllApprovedTopicsResponse.builder()
                        .topicID(topic.getId())
                        .topicTitle(topic.getTitle())
                        .description(topic.getDescription())
                        .build()).toList();
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
        
        topics.setStatus(topicsDTO.getStatus() != null && !topicsDTO.getStatus().isEmpty() 
            ? topicsDTO.getStatus() 
            : "PENDING");
        topics.setFilePathUrl(topicsDTO.getFilePathUrl());
        return topics;
    }

    private TopicsDTOResponse convertToDTO(Topics topics){
        TopicsDTOResponse topicsDTO = new TopicsDTOResponse();
        topicsDTO.setId(topics.getId());
        topicsDTO.setTitle(topics.getTitle());
        topicsDTO.setDescription(topics.getDescription());
        topicsDTO.setSubmitedAt(topics.getSubmitedAt() != null ? topics.getSubmitedAt().toString() : null);
        topicsDTO.setStatus(topics.getStatus());
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
}
