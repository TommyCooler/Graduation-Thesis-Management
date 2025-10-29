package mss.project.checkplagiarismservice.controllers;

import lombok.RequiredArgsConstructor;
import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.dtos.response.N8nResponse;
import mss.project.checkplagiarismservice.services.PlagiarismService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
public class PlagiarismController {
    
    private final PlagiarismService plagiarismService;
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> checkHealth() {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status("success")
                .message("Plagiarism Service is healthy")
                .data("OK")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check")
    public Mono<ResponseEntity<ApiResponse<N8nResponse>>> checkPlagiarism(
            @RequestPart("file") FilePart file,
            @RequestParam(required = false) String prefix,
            @RequestParam Long topicId) {
        
        System.out.println("========== PLAGIARISM CHECK REQUEST ==========");
        System.out.println("File: " + (file != null ? file.filename() : "null"));
        System.out.println("Prefix: " + prefix);
        System.out.println("Topic ID: " + topicId);
        
        return plagiarismService.checkPlagiarism(file, prefix, topicId)
                .map(result -> {
                    ApiResponse<N8nResponse> response = ApiResponse.<N8nResponse>builder()
                            .status("success")
                            .message("Plagiarism check completed successfully")
                            .data(result)
                            .build();
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    System.err.println("========== PLAGIARISM CHECK ERROR ==========");
                    System.err.println("Error message: " + e.getMessage());
                    System.err.println("Error type: " + e.getClass().getName());
                    e.printStackTrace();
                    
                    ApiResponse<N8nResponse> response = ApiResponse.<N8nResponse>builder()
                            .status("error")
                            .message("Failed to check plagiarism: " + e.getMessage())
                            .data(null)
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response));
                });
    }

}
