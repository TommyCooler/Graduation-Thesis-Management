package mss.project.accountservice.services;

import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;

import java.util.Optional;

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

    @Override
    public Account getAccountById(Long id) {
        Optional<Account> accountOpt = accountRepository.findById(id);
        if(accountOpt.isEmpty()) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        return accountOpt.get();
    }
}
