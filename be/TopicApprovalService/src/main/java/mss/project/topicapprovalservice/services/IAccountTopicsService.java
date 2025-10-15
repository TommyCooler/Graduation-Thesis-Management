package mss.project.topicapprovalservice.services;


public interface IAccountTopicsService {

    void assignTopicToAccount(Long accountId, Long topicId);
    void removeTopicFromAccount(Long accountId, Long topicId);
}
