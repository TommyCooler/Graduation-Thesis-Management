package mss.project.accountservice.services;

import jakarta.servlet.http.HttpServletResponse;
import mss.project.accountservice.dtos.requests.LoginRequest;
import mss.project.accountservice.dtos.requests.RegisterRequest;
import mss.project.accountservice.dtos.responses.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request, HttpServletResponse httpResponse);
    void register(RegisterRequest request);
    void verifyEmail(String token);

    void verifyOtp(String email);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void logout(HttpServletResponse response);

    void provideEmail(String email);

    void changePasswordWhenFirstLogin(String email, String newPassword);

}
