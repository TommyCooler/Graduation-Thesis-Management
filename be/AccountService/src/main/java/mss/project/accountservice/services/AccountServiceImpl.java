package mss.project.accountservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public Account findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }
    
    @Override
    public boolean existsById(Long id) {
        return accountRepository.existsById(id);
    }
}
