package mss.project.accountservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import mss.project.accountservice.dtos.requests.*;
import mss.project.accountservice.dtos.responses.AccountResponse;
import mss.project.accountservice.dtos.responses.ApiResponse;
import mss.project.accountservice.dtos.responses.LoginResponse;
import mss.project.accountservice.services.AuthService;
import mss.project.accountservice.services.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login with email and password")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletResponse httpResponse) {
        LoginResponse response = authService.login(request, httpResponse);
        ApiResponse<LoginResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Đăng nhập thành công.");
        apiResponse.setData(response);
        return apiResponse;
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new account")
    public ApiResponse<?> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Tạo khoản thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.");
        return apiResponse;
    }

    @GetMapping("/verify")
    public ApiResponse<?> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        ApiResponse<?> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.");
        return apiResponse;
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send OTP", description = "Send a 6-digit OTP to email")
    public ApiResponse<?> sendOtp(@RequestBody @Valid SendMailRequest req) {
        otpService.sendOtpToEmail(req.getEmail());
        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Đã gửi OTP tới email.");
        return res;
    }

    @PostMapping("/otp/resend")
    @Operation(summary = "Resend OTP", description = "Resend OTP to email (rate-limited)")
    public ApiResponse<?> resendOtp(@RequestBody @Valid SendMailRequest req) {
        otpService.resendOtp(req.getEmail());
        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Đã gửi lại OTP.");
        return res;
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP", description = "Verify a 6-digit OTP and activate the account")
    public ApiResponse<?> verifyOtp(@RequestBody @Valid VerifyOtpRequest req) {
        boolean ok = otpService.verifyOtp(req.getEmail(), req.getCode());
        if (!ok) {
            ApiResponse<?> res = new ApiResponse<>();
            res.setCode(401);
            res.setMessage("Mã OTP không đúng.");
            return res;
        }

        authService.verifyOtp(req.getEmail());

        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.");
        return res;
    }

    @PostMapping("/otp/clear-quota")
    @Operation(summary = "Clear OTP quota", description = "Clear OTP sending quota for an email (for testing)")
    public ApiResponse<?> clearOtpQuota(@RequestBody @Valid SendMailRequest req) {
        otpService.clearOtpQuotaFor(req.getEmail());
        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Đã xoá hạn mức OTP cho email.");
        return res;
    }

    @PostMapping("/password/forgot")
    @Operation(summary = "Request password reset", description = "Request a password reset email")
    public ApiResponse<?> requestPasswordReset(@RequestBody SendMailRequest req) {
        authService.forgotPassword(req.getEmail());
        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi.");
        return res;
    }

    @PostMapping("/password/reset")
    @Operation(summary = "Confirm password reset", description = "Reset password using the token from email")
    public ApiResponse<?> confirmPasswordReset(@RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.getToken(), req.getNewPassword());
        ApiResponse<?> res = new ApiResponse<>();
        res.setMessage("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.");
        return res;
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        authService.logout(response);
    }


    @GetMapping("/me")
    @Operation(summary = "Get current account", description = "Get information of the currently authenticated account")
    public ApiResponse<AccountResponse> getCurrentAccount(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            ApiResponse<AccountResponse> res = new ApiResponse<>();
            res.setCode(401);
            res.setMessage("Chưa xác thực.");
            return res;
        }
        AccountResponse res = new AccountResponse();
        res.setEmail(jwt.getClaimAsString("email"));
        res.setName(jwt.getClaimAsString("name"));
        res.setRole(jwt.getClaimAsString("role"));
        ApiResponse<AccountResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(res);
        return apiResponse;
    }


}
