package mss.project.accountservice.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.util.Base64;

@Configuration
public class JwtDecoderConfig {

    @Value("${app.jwt.secret-base64}")
    private String secretB64;

    @Bean
    JwtDecoder jwtDecoder() {
        byte[] keyBytes = Base64.getDecoder().decode(secretB64);
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        OAuth2TokenValidator<Jwt> timestamps = new JwtTimestampValidator(Duration.ofSeconds(60));
        OAuth2TokenValidator<Jwt> requireSub = new JwtClaimValidator<String>("sub", v -> v != null && !v.isBlank());

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestamps, requireSub));
        return decoder;
    }
}