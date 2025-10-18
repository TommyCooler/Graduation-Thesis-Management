package mss.project.accountservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.services.AccountService;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account Service", description = "Account management operations and health checks")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping
    public String getAccounts() {
        return "List of accounts";
    }

    @GetMapping("/email/{email}")
    public Account getAccountByEmail(@PathVariable String email) {
        return accountService.findByEmail(email);
    }
    
    @GetMapping("/{id}")
    public boolean existsById(@PathVariable Long id) {
        return accountService.existsById(id);
    }
}
