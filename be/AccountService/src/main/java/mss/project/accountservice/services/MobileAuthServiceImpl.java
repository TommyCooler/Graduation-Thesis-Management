package mss.project.accountservice.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import mss.project.accountservice.dtos.responses.GoogleAuthResponse;
import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
import mss.project.accountservice.pojos.Account;
import mss.project.accountservice.repositories.AccountRepository;
import mss.project.accountservice.utils.JwtTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class MobileAuthServiceImpl implements MobileAuthService {

    private final AccountRepository accountRepository;
    private final JwtTokenGenerator jwtTokenGenerator;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public GoogleAuthResponse authenticateGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            Account account = accountRepository.findByEmail(email);

            if (account == null) {
                throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
            }

            if (!account.isActive()) {
                account.setActive(true);
                accountRepository.save(account);
            }

            String jwtToken = jwtTokenGenerator.generate(
                    account.getId(),
                    account.getName(),
                    account.getEmail(),
                    account.getRole().name()
            );

            return GoogleAuthResponse.builder()
                    .accessToken(jwtToken)
                    .tokenType("Bearer")
                    .expiresIn(Duration.ofDays(30).toSeconds())
                    .user(GoogleAuthResponse.UserInfo.builder()
                            .id(account.getId())
                            .name(account.getName())
                            .email(account.getEmail())
                            .role(account.getRole().name())
                            .build())
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
        }
    }
}