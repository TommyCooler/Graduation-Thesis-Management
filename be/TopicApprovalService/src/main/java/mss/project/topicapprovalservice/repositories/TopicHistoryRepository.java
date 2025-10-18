package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.TopicHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicHistoryRepository extends JpaRepository<TopicHistory, Long> {
    List<TopicHistory> findByTopicIdOrderByUpdatedAtDesc(Long topicId);
    List<TopicHistory> findByUpdatedByOrderByUpdatedAtDesc(String updatedBy);
}