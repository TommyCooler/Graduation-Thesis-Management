package mss.project.accountservice.services;

import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletResponse;
import mss.project.accountservice.dtos.requests.LoginRequest;
import mss.project.accountservice.dtos.requests.RegisterRequest;
import mss.project.accountservice.dtos.responses.LoginResponse;
import mss.project.accountservice.enums.Role;
import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
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

    @Override
    public LoginResponse login(LoginRequest request, HttpServletResponse httpResponse) {
        // Mock login - in real implementation, this would validate against database
        // For now, accept any email that ends with @fe.edu.vn
        if (!request.getEmail().endsWith("@fe.edu.vn")) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
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
        // Mock registration - in real implementation, this would save to database
        if (!request.getEmail().endsWith("@fe.edu.vn")) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        
        String token = jwtTokenGenerator.generateEmailVerifyToken(request.getEmail());
        mailService.sendVerificationEmail(request.getEmail(), token);
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

}
