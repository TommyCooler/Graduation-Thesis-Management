package mss.project.topicapprovalservice.repositorys;


import mss.project.topicapprovalservice.pojos.AccountTopics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

@RestController
public interface AccountTopicsRepository extends JpaRepository<AccountTopics, Long> {
}
