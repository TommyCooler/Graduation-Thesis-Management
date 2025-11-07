package mss.project.checkplagiarismservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mss.project.checkplagiarismservice.dtos.request.PlagiarismReportRequest;
import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.services.PlagiarismService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
@Slf4j
public class PlagiarismController {
    
    private final PlagiarismService plagiarismService;
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> checkHealth() {
        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Plagiarism Service is healthy");
        response.setData("OK");
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<ApiResponse<String>>> send(
            @RequestPart("file") FilePart file,
            @RequestParam Long topicId) {

        // Validate file
        if (file == null) {
            ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                    .code(400)
                    .message("File is required and cannot be empty")
                    .data("")
                    .build();
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }

        return plagiarismService.sendDataToN8n(file, topicId)
                .map(isSend -> {
                    ApiResponse<String> response = ApiResponse.<String>builder()
                            .code(200)
                            .message(isSend ? "Send file to n8n success" : "Send file to n8n failed")
                            .data("")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                            .code(500)
                            .message("Error processing file: " + e.getMessage())
                            .data("")
                            .build();
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse));
                });
    }

    @PostMapping("/delete-topic-qdrant")
    public Mono<ResponseEntity<ApiResponse<String>>> deleteTopicFromQdrant(
            @RequestParam Long topicId) {

        // Validate topicId
        if (topicId == null) {
            ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                    .code(400)
                    .message("TopicId is required and cannot be empty")
                    .data("")
                    .build();
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }

        return plagiarismService.deleteTopicFromQdrant(topicId)
                .map(isDeleted -> {
                    ApiResponse<String> response = ApiResponse.<String>builder()
                            .code(200)
                            .message(isDeleted ? "Delete topic from Qdrant success" : "Delete topic from Qdrant failed")
                            .data("")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(e -> {
                    ApiResponse<String> errorResponse = ApiResponse.<String>builder()
                            .code(500)
                            .message("Error deleting topic from Qdrant: " + e.getMessage())
                            .data("")
                            .build();
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse));
                });
    }

    @PostMapping("/report/{id}")
    public ResponseEntity<ApiResponse<?>> receiveN8NResponse(@PathVariable Long id, @RequestBody PlagiarismReportRequest reportRequest) {
        try {
            log.info("Received N8N report webhook");
            log.debug("Report request: {} payload(s)", 
                    reportRequest != null && reportRequest.getPayloads() != null 
                            ? reportRequest.getPayloads().size() : 0);

            // Process the report and save to database
            plagiarismService.processPlagiarismReport(reportRequest, id);

            System.out.println(reportRequest);

            return ResponseEntity.ok(ApiResponse.builder()
                    .code(200)
                    .message("Plagiarism report received and processed successfully")
                    .data(reportRequest.getPayloads())
                    .build()
            );
        } catch (Exception e) {
            log.error("Error processing N8N report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.builder()
                            .code(500)
                            .message("Error processing report: " + e.getMessage())
                            .data(null)
                            .build()
                    );
        }
    }

}
