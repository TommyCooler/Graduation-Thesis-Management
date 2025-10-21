package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ProgressReviewCouncilRepository extends JpaRepository<ProgressReviewCouncils, Long> {
    List<ProgressReviewCouncils> findAllByTopic(Topics topic);
    ProgressReviewCouncils findByCouncilID(Long councilID);


}
