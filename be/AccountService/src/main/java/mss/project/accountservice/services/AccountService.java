package mss.project.accountservice.services;

import mss.project.accountservice.dtos.responses.AccountPerPageResponse;
import mss.project.accountservice.dtos.responses.AccountResponse;
import mss.project.accountservice.dtos.responses.PageResponse;
import mss.project.accountservice.pojos.Account;

import java.util.List;

public interface AccountService {
    Account findByEmail(String email);
    boolean existsById(Long id);
    Account getAccountById(Long id);
    List<Account> getAllAccounts();
    AccountResponse findById(Long id);

    PageResponse<AccountPerPageResponse> getAccountsPaged(int page, int size);
}
