package mss.project.topicapprovalservice.services;


public interface AccountTopicsService {

    void assignTopicToAccount(Long accountId, Long topicId);
    void removeTopicFromAccount(Long accountId, Long topicId);
}
