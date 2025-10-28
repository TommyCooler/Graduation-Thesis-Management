package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountTopicsRepository extends JpaRepository<AccountTopics, Long> {

    List<Long> findAccountIdByTopics_Id(Long topicId);
    List<AccountTopics> findByTopics_Id(Long topicId);
    Long findAccountIdByTopics(Topics topic);
    List<AccountTopics> findByTopicsId(Long topicId);
    Optional<AccountTopics> findByTopicsIdAndAccountId(Long topicId, Long accountId);
    boolean existsByTopicsIdAndAccountId(Long topicsId, Long accountId);
    void deleteByTopicsId(Long topicId);
}
