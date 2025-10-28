package mss.project.topicapprovalservice.services;



import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.dtos.responses.AccountTopicsDTOResponse;

import java.util.List;

public interface TopicService {

    TopicsDTOResponse getTopicbById(Long topicId);
    TopicsDTOResponse createTopic(TopicsDTORequest topicsDTO, Long creatorId, String creatorName);
    TopicsDTOResponse updateTopic(Long Id, TopicsDTORequest topicsDTO);
    void deleteTopic(Long topicId);
    List<TopicsDTOResponse> getAllTopics();
    TopicsDTOResponse approveTopic(Long topicId, String email);
    TopicsDTOResponse rejectTopic(Long topicId, String email);
    List<GetAllApprovedTopicsResponse> getApprovedTopics();
    AccountTopicsDTOResponse joinTopic(Long topicId, Long memberId, String memberName);
    List<AccountTopicsDTOResponse> getTopicMembers(Long topicId);
}
