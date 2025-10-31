package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.Council;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouncilRepository extends JpaRepository<Council, Long> {
}
