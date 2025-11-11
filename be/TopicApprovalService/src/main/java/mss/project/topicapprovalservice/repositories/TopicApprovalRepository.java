package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.TopicApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicApprovalRepository extends JpaRepository<TopicApproval, Long> {
    List<TopicApproval> findByTopicId(Long topicId);
    Optional<TopicApproval> findByTopicIdAndApproverEmail(Long topicId, String approverEmail);
    boolean existsByTopicIdAndApproverEmail(Long topicId, String approverEmail);
    long countByTopicId(Long topicId);
    void deleteByTopicId(Long topicId);
    List<TopicApproval> findByApproverEmail(String approverEmail);
    TopicApproval findByApproverEmailAndTopicIdAndApprovedFirstIsTrue(String approverEmail, Long topicId);
}
