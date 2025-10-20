package mss.project.checkplagiarismservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
public class PlagiarismController {
    
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        return ResponseEntity.ok("Plagiarism Controller is healthy");
    }

    @PostMapping("/")
    public ResponseEntity<?> checkPlagiarism(@RequestBody MultipartFile file) {
        return ResponseEntity.ok("Plagiarism Controller is ready");
    }

}
