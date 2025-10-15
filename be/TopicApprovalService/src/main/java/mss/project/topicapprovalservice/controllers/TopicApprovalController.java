package mss.project.topicapprovalservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/topic-approval")
@Tag(name = "Topic Approval Service", description = "Topic approval operations and health checks")
public class TopicApprovalController {

    @GetMapping("/health")
    @Operation(summary = "Topic Approval Service Health Check", description = "Returns the health status of the Topic Approval Service")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Topic Approval Service is healthy"),
            @ApiResponse(responseCode = "503", description = "Topic Approval Service is unhealthy")
    })
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Topic Approval Service");
        health.put("message", "Topic Approval Service is running...");
        health.put("timestamp", LocalDateTime.now());
        health.put("port", 8083);
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/info")
    @Operation(summary = "Topic Approval Service Information", description = "Returns basic information about the Topic Approval Service")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Topic Approval Service information retrieved successfully")
    })
    public ResponseEntity<Map<String, Object>> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Topic Approval Service");
        info.put("version", "1.0.0");
        info.put("description", "Service for managing thesis topic approval workflows");
        info.put("timestamp", LocalDateTime.now());
        info.put("features", new String[]{"Topic Submission", "Approval Workflow", "Review Management", "Status Tracking"});
        
        return ResponseEntity.ok(info);
    }
}
