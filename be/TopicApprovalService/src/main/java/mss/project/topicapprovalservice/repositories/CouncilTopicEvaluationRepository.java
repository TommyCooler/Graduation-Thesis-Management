package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.CouncilMember;
import mss.project.topicapprovalservice.pojos.CouncilTopicEvaluation;
import mss.project.topicapprovalservice.pojos.Topics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouncilTopicEvaluationRepository extends JpaRepository<CouncilTopicEvaluation, Long> {
    Optional<CouncilTopicEvaluation> findByTopicIdAndCouncilMemberId(Long topicId,Long councilMemberId);
    List<CouncilTopicEvaluation> findAllByTopic(Topics topic);
    List<CouncilTopicEvaluation> findAllByCouncilMember(CouncilMember member);
}
