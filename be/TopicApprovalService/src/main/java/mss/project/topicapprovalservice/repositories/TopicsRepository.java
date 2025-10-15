package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TopicsRepository extends JpaRepository<Topics, Long> {
}
