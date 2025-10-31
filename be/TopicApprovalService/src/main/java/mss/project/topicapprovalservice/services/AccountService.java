package mss.project.topicapprovalservice.services;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import mss.project.topicapprovalservice.dtos.responses.AccountDTO;

import java.util.List;

@FeignClient(name = "account-service", url = "http://localhost:8081")
public interface  AccountService {

    @GetMapping("/api/accounts/{id}")
    AccountDTO getAccountById(@PathVariable Long id);

    @GetMapping("/api/accounts/email/{email}")
    AccountDTO getAccountByEmail(@PathVariable String email);

    @GetMapping("/api/accounts/username/{username}")
    AccountDTO getAccountByUsername(@PathVariable String username);

    @GetMapping("/api/accounts/all")
    List<AccountDTO> getAllAccounts();

//    @GetMapping("/api/accounts/{id}/details")
//    AccountDTO getAccountById(@PathVariable Long id);
}
