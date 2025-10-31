package mss.project.topicapprovalservice.repositories;

import mss.project.topicapprovalservice.pojos.Council;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouncilRepository extends JpaRepository<Council, Long> {
    
//    @Query("SELECT c FROM Council c WHERE c.topic.id = :topicId")
//    Optional<Council> findByTopicId(@Param("topicId") Long topicId);
}
