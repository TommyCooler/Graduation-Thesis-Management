package mss.project.accountservice.controllers;

import lombok.RequiredArgsConstructor;
import mss.project.accountservice.dtos.requests.GoogleAuthRequest;
import mss.project.accountservice.dtos.responses.GoogleAuthResponse;
import mss.project.accountservice.services.MobileAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class MobileAuthController {

    private final MobileAuthService mobileAuthService;

    @PostMapping("/google/mobile")
    public ResponseEntity<GoogleAuthResponse> authenticateWithGoogle(
            @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(mobileAuthService.authenticateGoogleToken(request.getIdToken()));
    }
}