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
    private AccountRepository accountRepository;

    @Autowired
    private JwtTokenGenerator jwtTokenGenerator;
    @Autowired
    private MailService mailService;

    @Override
    public LoginResponse login(LoginRequest request, HttpServletResponse httpResponse) {
        Account account = accountRepository.findByEmail(request.getEmail());
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }
        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
        if(!account.isActive()){
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }
        LoginResponse response = new LoginResponse();
        String token = jwtTokenGenerator.generate(account.getId(), account.getEmail(), account.getRole().toString());
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
    public void register(RegisterRequest request) {
        Account existingAccount = accountRepository.findByEmail(request.getEmail());
        if (existingAccount != null) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        Account newAccount = new Account();
        newAccount.setEmail(request.getEmail());
        newAccount.setPassword(passwordEncoder.encode(request.getPassword()));
        newAccount.setName(request.getName());
        newAccount.setPhoneNumber(request.getPhoneNumber());
        newAccount.setActive(false);
        newAccount.setRole(Role.LECTURER);
        accountRepository.save(newAccount);

        String token = jwtTokenGenerator.generateEmailVerifyToken(newAccount.getEmail());

        mailService.sendVerificationEmail(newAccount.getEmail(), token);
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

            Account account = accountRepository.findByEmail(email);
            if (account == null) throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);

            account.setActive(true);
            accountRepository.save(account);

        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

}
