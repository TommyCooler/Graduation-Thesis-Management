package mss.project.topicapprovalservice.services;



import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;

import java.util.List;

public interface ITopicService {

    TopicsDTOResponse getTopicbById(Long topicId);
    TopicsDTOResponse createTopic(TopicsDTORequest topicsDTO);
    TopicsDTOResponse updateTopic(Long Id,TopicsDTORequest topicsDTO);
    void deleteTopic(Long topicId);
    List<TopicsDTOResponse> getAllTopics();
}
