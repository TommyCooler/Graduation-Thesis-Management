package mss.project.topicapprovalservice.services;

import jakarta.persistence.EntityNotFoundException;


import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TopicsServiceImpl implements ITopicService {

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private TopicsRepository topicsRepository;


    @Override
    public TopicsDTOResponse getTopicbById(Long topicId) {
        Topics topics = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        return convertToDTO(topics);
    }

    @Override
    public TopicsDTOResponse createTopic(TopicsDTORequest topicsDTO) {
        Topics topics = convertToEntity(topicsDTO);
        topicsRepository.save(topics);
        TopicsDTOResponse createdTopicDTO = convertToDTO(topics);
        return createdTopicDTO;
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
    public void deleteTopic(Long topicId) {
        if (!topicsRepository.existsById(topicId)) {
            throw new AppException(ErrorCode.TOPICS_NOT_FOUND);
        }
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
    public TopicsDTOResponse approveTopic(Long topicId, String email) { // Thay accountId bằng email
        // Kiểm tra quyền truy cập
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

    private Topics convertToEntity(TopicsDTORequest topicsDTO){
        Topics topics = new Topics();
        topics.setTitle(topicsDTO.getTitle());
        topics.setDescription(topicsDTO.getDescription());
        topics.setSubmitedAt(LocalDateTime.parse(topicsDTO.getSubmitedAt()));
        topics.setStatus("PENDING");
        topics.setFilePathUrl(topicsDTO.getFilePathUrl());
        return topics;
    }

    private TopicsDTOResponse convertToDTO(Topics topics){
        TopicsDTOResponse topicsDTO = new TopicsDTOResponse();
        topicsDTO.setId(topics.getId());
        topicsDTO.setTitle(topics.getTitle());
        topicsDTO.setDescription(topics.getDescription());
        topicsDTO.setSubmitedAt(topics.getSubmitedAt().toString());
        topicsDTO.setStatus(topics.getStatus());
        topicsDTO.setFilePathUrl(topics.getFilePathUrl());
        topicsDTO.setCreatedAt(topics.getCreatedAt().toString());
        topicsDTO.setUpdatedAt(topics.getUpdatedAt().toString());
        return topicsDTO;
    }
}
