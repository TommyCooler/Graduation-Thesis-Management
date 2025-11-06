package mss.project.checkplagiarismservice.exceptions;

import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // NotFound tuỳ biến
    @ExceptionHandler(ClassNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ClassNotFoundException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(404);
        response.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // Lỗi validate @Valid trên @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        ApiResponse<Map<String, String>> response = new ApiResponse<>();
        response.setCode(400);
        response.setMessage("Validation failed");
        response.setData(fieldErrors); // trả về lỗi theo từng field
        return ResponseEntity.badRequest().body(response);
    }

    // Lỗi validate @Validated trên @RequestParam, @PathVariable
//    @ExceptionHandler(ConstraintViolationException.class)
//    public ResponseEntity<ApiResponse<List<String>>> handleConstraintViolation(ConstraintViolationException ex) {
//        List<String> messages = ex.getConstraintViolations().stream()
//                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
//                .toList();
//
//        return ResponseEntity.badRequest().body(
//                ApiResponse.<List<String>>builder()
//                        .status("error")
//                        .message("Validation failed")
//                        .data(messages)
//                        .build()
//        );
//    }

    // Bắt-all (đặt cuối cùng)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        // TODO: log lỗi chi tiết (ex) vào logger/observability
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(500);
        response.setMessage("Internal server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

