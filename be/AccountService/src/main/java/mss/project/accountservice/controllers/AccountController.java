package mss.project.accountservice.controllers;

import mss.project.accountservice.dtos.requests.UpdateAccountRequest;
import mss.project.accountservice.dtos.responses.AccountPerPageResponse;
import mss.project.accountservice.dtos.responses.AccountResponse;
import mss.project.accountservice.dtos.responses.ApiResponse;
import mss.project.accountservice.dtos.responses.PageResponse;
import mss.project.accountservice.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.services.AccountService;
import mss.project.accountservice.services.MailService;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account Service", description = "Account management operations and health checks")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private MailService mailService;

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
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Account currentAccount = accountService.getAccountById(Long.parseLong(jwt.getSubject()));
        PageResponse<AccountPerPageResponse> response = accountService.getAccountsPaged(page - 1, size, currentAccount);
        ApiResponse<PageResponse<AccountPerPageResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setData(response);
        return apiResponse;
    }

    @GetMapping("/current-account")
    public ApiResponse<AccountResponse> getCurrentAccount(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setData(accountService.getCurrentAccount(email));
        response.setMessage("Current account found");
        return response;
    }

    @PutMapping("/{id}")
    public ApiResponse<?> updateAccountProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateAccountRequest request
    ) {
        Long id = jwt.getSubject() != null ? Long.parseLong(jwt.getSubject()) : null;
        accountService.updateAccountProfile(id, request);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Cập nhật thông tin tài khoản thành công.");
        return apiResponse;
    }

    @PutMapping("/{id}/admin-update-role")
    public ApiResponse<?> adminUpdateAccountRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        accountService.adminUpdateAccountRole(id, role);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Cập nhật vai trò tài khoản thành công.");
        return apiResponse;
    }

    @PostMapping("/mail/topic-approved")
    public ApiResponse<?> sendTopicApprovedEmail(
            @RequestParam String to,
            @RequestParam String topicTitle,
            @RequestParam String topicId
    ) {
        mailService.sendTopicApprovedEmail(to, topicTitle, topicId);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Email đã được gửi thành công.");
        return apiResponse;
    }

}
