package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.ProgressReviewCouncils;
import mss.project.topicapprovalservice.pojos.ReviewCouncilMembers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewCouncilMemberRepository extends JpaRepository<ReviewCouncilMembers, Long> {
    ReviewCouncilMembers findByProgressReviewCouncilAndAccountID(ProgressReviewCouncils council, Long accountID);
    List<ReviewCouncilMembers> findAllByProgressReviewCouncil(ProgressReviewCouncils council);
    Optional<String> findOverallCommentsByProgressReviewCouncilAndAccountID(ProgressReviewCouncils council, Long accountID);
}
