package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.AccountTopics;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RestController;

@Repository
public interface AccountTopicsRepository extends JpaRepository<AccountTopics, Long> {
    Long findAccountIdByTopics(Topics topic);
}
