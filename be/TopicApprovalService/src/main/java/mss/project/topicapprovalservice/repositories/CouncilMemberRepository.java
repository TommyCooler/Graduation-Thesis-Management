package mss.project.topicapprovalservice.repositories;


import mss.project.topicapprovalservice.pojos.CouncilMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CouncilMemberRepository extends JpaRepository<CouncilMember, Long> {


    List<CouncilMember> findByCouncil_DefenseDate(LocalDate date);

    List<CouncilMember> findByCouncil_Id(long id);

    List<CouncilMember> findByAccountId(long accountId);
}
