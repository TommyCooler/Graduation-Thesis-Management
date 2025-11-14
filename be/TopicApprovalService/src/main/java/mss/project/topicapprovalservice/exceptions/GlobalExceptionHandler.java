package mss.project.topicapprovalservice.exceptions;



import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationError(MethodArgumentNotValidException ex) {
        String message = ex.getFieldError().getDefaultMessage();
        ApiResponse<?> response;

        try {
            ErrorCode errorCode = ErrorCode.valueOf(message);
            response = ApiResponse.builder()
                    .code(errorCode.getCode())
                    .message(errorCode.getMessage())
                    .build();
        } catch (IllegalArgumentException e) {
            response = ApiResponse.builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message(message)
                    .build();
        }

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<?> response = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        // Sử dụng đúng HTTP status code từ errorCode thay vì luôn trả về 400
        HttpStatus httpStatus = HttpStatus.resolve(errorCode.getCode());
        if (httpStatus == null) {
            httpStatus = HttpStatus.BAD_REQUEST; // Fallback nếu code không hợp lệ
        }
        return ResponseEntity.status(httpStatus).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneralException(Exception ex) {
        ApiResponse<?> response = ApiResponse.builder()
                .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Đã xảy ra lỗi hệ thống: " + ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
