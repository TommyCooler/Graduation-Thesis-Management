package mss.project.accountservice.services;

import mss.project.accountservice.dtos.responses.AccountPerPageResponse;
import mss.project.accountservice.dtos.responses.AccountResponse;
import mss.project.accountservice.dtos.responses.PageResponse;
import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;

import java.util.Optional;

import java.util.List;

import java.util.List;
import java.util.stream.Collectors;

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
        if (accountOpt.isEmpty()) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        return accountOpt.get();
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public AccountResponse findById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setName(account.getName());
        response.setEmail(account.getEmail());
        response.setPhoneNumber(account.getPhoneNumber());
        response.setRole(account.getRole().toString());
        return response;
    }

    @Override
    public PageResponse<AccountPerPageResponse> getAccountsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Account> accountPage = accountRepository.findAll(pageable);

        return PageResponse.<AccountPerPageResponse>builder()
                .content(accountPage.getContent().stream()
                        .map(acc -> AccountPerPageResponse.builder()
                                .id(acc.getId())
                                .name(acc.getName())
                                .email(acc.getEmail())
                                .role(acc.getRole().toString())
                                .isActive(acc.isActive())
                                .createdAt(acc.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .currentPage(accountPage.getNumber() + 1)
                .totalPages(accountPage.getTotalPages())
                .totalElements(accountPage.getTotalElements())
                .pageSize(accountPage.getSize())
                .build();
    }
}

