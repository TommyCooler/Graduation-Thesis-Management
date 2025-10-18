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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        acc.setName(request.getName());
        acc.setEmail(email);
        acc.setPassword(passwordEncoder.encode(request.getPassword()));
        acc.setRole(Role.LECTURER);
        acc.setPhoneNumber(request.getPhoneNumber());
        acc.setActive(false);

        try {
            accountRepository.save(acc);

        } catch (DataIntegrityViolationException e) {
            Account again = accountRepository.findByEmail(email);
            if (again != null && again.isActive()) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            if (again != null) {
                again.setName(request.getName());
                again.setPassword(passwordEncoder.encode(request.getPassword()));
                again.setPhoneNumber(request.getPhoneNumber());
                again.setActive(false);
                accountRepository.save(again);
            } else {
                throw e;
            }
        }

            otpService.sendOtpToEmail(email);

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


}
