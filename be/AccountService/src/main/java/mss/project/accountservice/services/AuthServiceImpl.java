package mss.project.accountservice.services;

import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletResponse;
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
        if(!account.isActive()) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVE);
        }

        LoginResponse response = new LoginResponse();
        String token = jwtTokenGenerator.generate(1L, request.getEmail(), Role.LECTURER.toString());
        response.setRole(Role.LECTURER.toString());
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
    public void register(RegisterRequest request) {
        if (!request.getEmail().endsWith("")) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        Account account = new Account();
        account.setName(request.getName());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(Role.LECTURER);
        account.setPhoneNumber(request.getPhoneNumber());
        account.setActive(false);

        accountRepository.save(account);

        otpService.sendOtpToEmail(request.getEmail());
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

            // Mock verification - in real implementation, this would update database
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

}
