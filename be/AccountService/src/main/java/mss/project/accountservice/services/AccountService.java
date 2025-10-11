package mss.project.accountservice.services;

import mss.project.accountservice.pojos.Account;

public interface AccountService {
    Account findByEmail(String email);
    boolean existsById(Long id);
}
