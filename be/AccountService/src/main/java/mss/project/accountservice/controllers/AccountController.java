package mss.project.accountservice.controllers;

import mss.project.accountservice.dtos.responses.AccountPerPageResponse;
import mss.project.accountservice.dtos.responses.AccountResponse;
import mss.project.accountservice.dtos.responses.ApiResponse;
import mss.project.accountservice.dtos.responses.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.services.AccountService;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account Service", description = "Account management operations and health checks")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/all")
    public List<Account> getAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/email/{email}")
    public Account getAccountByEmail(@PathVariable String email) {
        return accountService.findByEmail(email);
    }
    
    @GetMapping("/{id}")
    public AccountResponse existsById(@PathVariable Long id) {
        return accountService.findById(id);
    }

    @GetMapping("/{id}/details")
    public Account getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @GetMapping("/all-paged")
    public ApiResponse<PageResponse<AccountPerPageResponse>> getAllAccounts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<AccountPerPageResponse> response = accountService.getAccountsPaged(page - 1, size);
        ApiResponse<PageResponse<AccountPerPageResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setData(response);
        return apiResponse;
    }

}
