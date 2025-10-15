package mss.project.subjectservice.repositories;

import mss.project.subjectservice.pojos.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentID(Long departmentID);
    Optional<Department> findByDepartmentName(String departmentName);
    void deleteByDepartmentID(Long departmentID);
}
