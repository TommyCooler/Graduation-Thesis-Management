package mss.project.accountservice.services;

import mss.project.accountservice.dtos.responses.GoogleAuthResponse;

public interface MobileAuthService {
    GoogleAuthResponse authenticateGoogleToken(String idTokenString);
}
