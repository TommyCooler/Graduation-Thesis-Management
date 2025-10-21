package mss.project.topicapprovalservice.services;

import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;
import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.repositories.AccountTopicsRepository;
import mss.project.topicapprovalservice.repositories.TopicsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("accountTopicsServiceImpl")
public class AccountTopicsServiceImpl implements AccountTopicsService {

    @Autowired
    private TopicsRepository topicsRepository;

    @Autowired
    private AccountTopicsRepository accountTopicsRepository;

    @Autowired
    private AccountService accountService;

    @Override
    public void assignTopicToAccount(Long accountId, Long topicId) {
        Topics topic = topicsRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPICS_NOT_FOUND));
        if(accountService.getAccountById(accountId) == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        AccountTopics accountTopics = new AccountTopics();
        accountTopics.setAccountId(accountId);
        accountTopics.setTopics(topic);
        accountTopicsRepository.save(accountTopics);
    }

    @Override
    public void removeTopicFromAccount(Long accountId, Long topicId) {

    }
}
