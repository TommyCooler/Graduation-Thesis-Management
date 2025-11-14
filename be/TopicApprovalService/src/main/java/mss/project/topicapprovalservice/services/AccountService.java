package mss.project.topicapprovalservice.services;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import mss.project.topicapprovalservice.dtos.responses.AccountDTO;

import java.util.List;

@FeignClient(name = "account-service", url = "${account.service.url}")
public interface AccountService {

    // Account endpoints
    @GetMapping("/api/accounts/{id}")
    AccountDTO getAccountById(@PathVariable Long id);

    @GetMapping("/api/accounts/email/{email}")
    AccountDTO getAccountByEmail(@PathVariable String email);

    @GetMapping("/api/accounts/username/{username}")
    AccountDTO getAccountByUsername(@PathVariable String username);

    @GetMapping("/api/accounts/all")
    List<AccountDTO> getAllAccounts();

    // Mail endpoints
    @PostMapping("/api/accounts/mail/topic-approved")
    void sendTopicApprovedEmail(
            @RequestParam("to") String to,
            @RequestParam("topicTitle") String topicTitle,
            @RequestParam("topicId") String topicId
    );
}
