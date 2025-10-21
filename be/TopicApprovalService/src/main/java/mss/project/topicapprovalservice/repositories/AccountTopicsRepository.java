package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Repository
public interface AccountTopicsRepository extends JpaRepository<AccountTopics, Long> {

    @Query("""
        SELECT at.accountId 
        FROM AccountTopics at 
        WHERE at.topics.id = :topicId
    """)
    List<Long> findAccountIdsByTopicId(@Param("topicId") Long topicId);
    Long findAccountIdByTopics(Topics topic);
}
