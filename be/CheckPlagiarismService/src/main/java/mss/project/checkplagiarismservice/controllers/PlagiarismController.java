package mss.project.checkplagiarismservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
public class PlagiarismController {
    
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        return ResponseEntity.ok("Plagiarism Controller is healthy");
    }
}
