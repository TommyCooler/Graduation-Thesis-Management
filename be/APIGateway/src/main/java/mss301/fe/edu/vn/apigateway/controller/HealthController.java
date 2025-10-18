package mss301.fe.edu.vn.apigateway.controller;

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
@RequestMapping("/api/gateway")
@Tag(name = "Gateway Health Check", description = "API Gateway health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Get Gateway Health Status", description = "Returns the health status of the API Gateway")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gateway is healthy"),
            @ApiResponse(responseCode = "503", description = "Gateway is unhealthy")
    })
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "API Gateway");
        health.put("timestamp", LocalDateTime.now());
        health.put("port", 8080);
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/info")
    @Operation(summary = "Get Gateway Information", description = "Returns basic information about the API Gateway")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Gateway information retrieved successfully")
    })
    public ResponseEntity<Map<String, Object>> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "API Gateway");
        info.put("version", "1.0.0");
        info.put("description", "Spring Cloud Gateway for Microservices");
        info.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(info);
    }
}
