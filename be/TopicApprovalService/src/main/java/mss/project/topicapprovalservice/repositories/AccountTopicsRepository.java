package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.pojos.Topics;
import mss.project.topicapprovalservice.enums.TopicRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountTopicsRepository extends JpaRepository<AccountTopics, Long> {

    List<Long> findAccountIdByTopics_Id(Long topicId);
    List<AccountTopics> findByTopics_Id(Long topicId);
//    Long findAccountIdByTopics(Topics topic);
    AccountTopics findByTopics(Topics topic);
    List<AccountTopics> findByTopicsId(Long topicId);
    Optional<AccountTopics> findByTopicsIdAndAccountId(Long topicId, Long accountId);
    boolean existsByTopicsIdAndAccountId(Long topicsId, Long accountId);
    void deleteByTopicsId(Long topicId);
    
    /**
     * Check if an account is a creator or member of a topic
     * Uses Spring Data JPA method naming convention
     * @param topicId the topic ID
     * @param accountId the account ID
     * @param roles list of roles to check (CREATOR, MEMBER)
     * @return true if the account is a creator or member of the topic
     */
    boolean existsByTopicsIdAndAccountIdAndRoleIn(Long topicId, Long accountId, List<TopicRole> roles);
}
