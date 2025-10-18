package mss.project.subjectservice.repositories;

import mss.project.subjectservice.pojos.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectName(String subjectName);
    Optional<Subject> findBySubjectCode(String subjectCode);
    Optional<Subject> findBySubjectID(Long subjectID);
    void deleteBySubjectID(Long subjectID);
}
