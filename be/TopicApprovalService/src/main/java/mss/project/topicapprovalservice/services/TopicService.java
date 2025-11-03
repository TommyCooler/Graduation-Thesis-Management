package mss.project.topicapprovalservice.services;



import mss.project.topicapprovalservice.dtos.responses.TopicWithApprovalStatusResponse;
import mss.project.topicapprovalservice.dtos.requests.TopicsDTORequest;
import mss.project.topicapprovalservice.dtos.responses.GetAllApprovedTopicsResponse;
import mss.project.topicapprovalservice.dtos.responses.TopicsDTOResponse;
import mss.project.topicapprovalservice.dtos.responses.AccountTopicsDTOResponse;
import mss.project.topicapprovalservice.enums.TopicStatus;

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
    List<TopicsDTOResponse> getTopicsByStatus(TopicStatus status);
    AccountTopicsDTOResponse joinTopic(Long topicId, Long memberId, String memberName);
    List<AccountTopicsDTOResponse> getTopicMembers(Long topicId);
    List<TopicsDTOResponse> getTopicsByCouncilNotNull();
    
    // New methods for 2-person approval workflow
    TopicWithApprovalStatusResponse approveTopicV2(Long topicId, String approverEmail, String approverName, String comment);
    List<TopicWithApprovalStatusResponse> getPendingTopicsForApproval(String userEmail);
    List<TopicWithApprovalStatusResponse> getApprovedTopicsByUser(String userEmail);
    List<TopicWithApprovalStatusResponse> getFullyApprovedTopics();
    
    // Check if user can edit topic (creator or member)
    boolean canUserEditTopic(Long topicId, Long accountId);
}
