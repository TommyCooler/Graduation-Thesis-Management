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
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.<Void>builder()
                        .status("error")
                        .message(ex.getMessage())
                        .build()
        );
    }

    // Lỗi validate @Valid trên @RequestBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        return ResponseEntity.badRequest().body(
                ApiResponse.<Map<String, String>>builder()
                        .status("error")
                        .message("Validation failed")
                        .data(fieldErrors) // trả về lỗi theo từng field
                        .build()
        );
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
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.<Void>builder()
                        .status("error")
                        .message("Internal server error")
                        .build()
        );
    }
}

