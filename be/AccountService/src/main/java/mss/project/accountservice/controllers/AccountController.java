package mss.project.accountservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public Account existsById(@PathVariable Long id) {
        return accountService.findById(id);
    }

    @GetMapping("/{id}/details")
    public Account getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

}
