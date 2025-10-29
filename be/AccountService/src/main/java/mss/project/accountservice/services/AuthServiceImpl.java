package mss.project.accountservice.services;

import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import mss.project.accountservice.dtos.requests.LoginRequest;
import mss.project.accountservice.dtos.requests.RegisterRequest;
import mss.project.accountservice.dtos.responses.LoginResponse;
import mss.project.accountservice.enums.Role;
import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;
import mss.project.accountservice.utils.JwtTokenGenerator;
import mss.project.accountservice.utils.TempPasswordGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Date;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenGenerator jwtTokenGenerator;

    @Autowired
    private MailService mailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public LoginResponse login(LoginRequest request, HttpServletResponse httpResponse) {
        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        if (account.getPassword() == null || !passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (!account.isActive()) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        LoginResponse response = new LoginResponse();
        String token = jwtTokenGenerator.generate(account.getId(), account.getName(), request.getEmail(), account.getRole().toString());
        response.setRole(account.getRole().toString());
        response.setToken(token);
        response.setFirstLogin(account.isFirstLogin());
        ResponseCookie cookie = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60 * 60 * 24 * 30)
                .sameSite("None")
                .build();

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return response;
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        final String email = request.getEmail().trim().toLowerCase();

        Account existing = accountRepository.findByEmail(email);
        if (existing != null && existing.isActive()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        Account acc = (existing != null) ? existing : new Account();
        acc.setEmail(email);
        acc.setName(request.getName());
        acc.setPassword(passwordEncoder.encode(request.getPassword()));
        acc.setPhoneNumber(request.getPhoneNumber());
        acc.setRole(Role.LECTURER);
        acc.setActive(false);
        acc.setFirstLogin(true);

        try {
            accountRepository.saveAndFlush(acc);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    otpService.sendOtpToEmail(email);
                }
            });
        } else {
            otpService.sendOtpToEmail(email);
        }
    }

    @Override
    public void verifyEmail(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            String email = jwt.getJWTClaimsSet().getSubject();
            Date exp = jwt.getJWTClaimsSet().getExpirationTime();

            if (exp.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            System.out.println("Email verified for: " + email);

        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public void verifyOtp(String email) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        account.setActive(true);
        accountRepository.save(account);
    }

    @Override
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        String resetToken = jwtTokenGenerator.generateEmailVerifyToken(email);
        mailService.sendPasswordResetEmail(email, resetToken);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            String email = jwt.getJWTClaimsSet().getSubject();
            Date exp = jwt.getJWTClaimsSet().getExpirationTime();
            String type = (String) jwt.getJWTClaimsSet().getClaim("type");

            if (exp.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }
            if (!"VERIFY_EMAIL".equals(type)) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            Account account = accountRepository.findByEmail(email);
            if (account == null) {
                throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
            }
            account.setPassword(passwordEncoder.encode(newPassword));
            accountRepository.save(account);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @Override
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .secure(true)
                .httpOnly(true)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    @Transactional
    public void provideEmail(String email) {
        String tempPassword = TempPasswordGenerator.generate(8);
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            account = new Account();
            account.setEmail(email);
            account.setName(email);
            account.setPassword(passwordEncoder.encode(tempPassword));
            account.setRole(Role.LECTURER);
            account.setFirstLogin(true);
            account.setActive(true);
            accountRepository.save(account);
            mailService.sendAccountProvisionEmail(email, tempPassword);
        } else {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    @Override
    @Transactional
    public void changePasswordWhenFirstLogin(String email, String newPassword) {
        Account account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        account.setPassword(passwordEncoder.encode(newPassword));
        account.setFirstLogin(false);
        accountRepository.save(account);
    }

}
