package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.TopicHistoryDTOResponse;
import mss.project.topicapprovalservice.pojos.Topics;

import java.util.List;

public interface TopicHistoryService {
    void recordTopicChange(Topics topic, String changedContent, String updatedBy, String actionType);
    List<TopicHistoryDTOResponse> getTopicHistory(Long topicId);
    List<TopicHistoryDTOResponse> getHistoryByUser(String username);
    Topics updateTopic(Long id, TopicsDTORequest request, String username);
}