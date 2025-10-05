package mss.project.accountservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import mss.project.accountservice.dtos.requests.LoginRequest;
import mss.project.accountservice.dtos.requests.RegisterRequest;
import mss.project.accountservice.dtos.responses.ApiResponse;
import mss.project.accountservice.dtos.responses.LoginResponse;
import mss.project.accountservice.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Login with email and password")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletResponse httpResponse){
        LoginResponse response = authService.login(request, httpResponse);
        ApiResponse<LoginResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Đăng nhập thành công.");
        apiResponse.setData(response);
        return apiResponse;
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new account")
    public ApiResponse<?> register(@RequestBody @Valid RegisterRequest request){
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
}
