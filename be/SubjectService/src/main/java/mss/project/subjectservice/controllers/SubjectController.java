package mss.project.subjectservice.controllers;

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
@RequestMapping("/api/subject")
@Tag(name = "Subject Service", description = "Subject management operations and health checks")
public class SubjectController {

    @GetMapping("/health")
    @Operation(summary = "Subject Service Health Check", description = "Returns the health status of the Subject Service")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject Service is healthy"),
            @ApiResponse(responseCode = "503", description = "Subject Service is unhealthy")
    })
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Subject Service");
        health.put("message", "Subject Service is running...");
        health.put("timestamp", LocalDateTime.now());
        health.put("port", 8082);
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/info")
    @Operation(summary = "Subject Service Information", description = "Returns basic information about the Subject Service")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject Service information retrieved successfully")
    })
    public ResponseEntity<Map<String, Object>> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Subject Service");
        info.put("version", "1.0.0");
        info.put("description", "Service for managing subjects and academic programs");
        info.put("timestamp", LocalDateTime.now());
        info.put("features", new String[]{"Subject Management", "Academic Program Management", "Curriculum Management"});
        
        return ResponseEntity.ok(info);
    }
}
