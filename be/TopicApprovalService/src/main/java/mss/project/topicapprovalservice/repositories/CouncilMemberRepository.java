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
    @Query("""
        SELECT cm.accountId
        FROM CouncilMember cm
        JOIN cm.council c
        WHERE c.date = :date AND c.slot = :slot""")
    List<Long> findBusyLecturers(@Param("date") LocalDate date, @Param("slot") int slot);
}
