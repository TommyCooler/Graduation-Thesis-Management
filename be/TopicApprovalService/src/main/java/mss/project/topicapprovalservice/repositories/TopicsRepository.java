package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.enums.TopicStatus;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TopicsRepository extends JpaRepository<Topics, Long> {
    Optional<Topics> findById(Long id);
    List<Topics> findByStatus(TopicStatus status);
    List<Topics> findByStatusIn(List<TopicStatus> statuses);
}
