package mss.project.accountservice.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import mss.project.accountservice.dtos.responses.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthHandlers {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            ApiResponse<Object> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpServletResponse.SC_UNAUTHORIZED);
            apiResponse.setMessage("Bạn chưa đăng nhập");

            writeResponse(response, apiResponse, HttpServletResponse.SC_UNAUTHORIZED);
        };
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            ApiResponse<Object> apiResponse = new ApiResponse<>();
            apiResponse.setCode(HttpServletResponse.SC_FORBIDDEN);
            apiResponse.setMessage("Bạn không có quyền truy cập tài nguyên này");

            writeResponse(response, apiResponse, HttpServletResponse.SC_FORBIDDEN);
        };
    }

    private void writeResponse(HttpServletResponse response, ApiResponse<Object> apiResponse, int status) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}

