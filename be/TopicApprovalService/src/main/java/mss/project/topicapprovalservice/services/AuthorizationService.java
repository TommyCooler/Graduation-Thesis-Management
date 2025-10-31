package mss.project.topicapprovalservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mss.project.topicapprovalservice.dtos.responses.AccountDTO;
import mss.project.topicapprovalservice.exceptions.AppException;
import mss.project.topicapprovalservice.exceptions.ErrorCode;

@Service
public class AuthorizationService {
    
    @Autowired
    private AccountService accountService;

    public AccountDTO checkHeadOfDepartmentPermission(String email) {
        AccountDTO account = accountService.getAccountByEmail(email);
        
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        
        if (!"HEADOFDEPARTMENT".equals(account.getRole())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        
        return account; // Trả về thông tin account nếu có quyền
    }
}
