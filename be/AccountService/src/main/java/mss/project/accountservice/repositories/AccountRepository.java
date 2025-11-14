package mss.project.accountservice.repositories;

import mss.project.accountservice.enums.Role;
import mss.project.accountservice.pojos.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {
    Account findByEmail(String email);
    Optional<Account> findById(Long id);
    Page<Account> findAllByRoleIn(List<Role> roles, Pageable pageable);
}