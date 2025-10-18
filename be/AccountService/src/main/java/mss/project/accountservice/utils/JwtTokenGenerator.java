package mss.project.accountservice.utils;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenGenerator {
    private final byte[] secret;

    public JwtTokenGenerator(@Value("${app.jwt.secret-base64}") String secretBase64) {
        this.secret = Base64.getDecoder().decode(secretBase64);
        if (this.secret.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes for HS256");
        }
    }

    private static final Duration DEFAULT_TTL = Duration.ofDays(30);

    public String generate(Long accountId, String name, String email, String role) {
        return generate(accountId, name, email, role, DEFAULT_TTL);
    }

    public String generate(Long accountId, String name, String email, String role, Duration ttl) {
        try {
            Instant now = Instant.now();
            // Claims
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(accountId.toString())
                    .claim("name", name)
                    .claim("email", email)
                    .claim("role", role)
                    .issueTime(Date.from(now))
                    .notBeforeTime(Date.from(now))
                    .expirationTime(Date.from(now.plus(ttl)))
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                    .type(JOSEObjectType.JWT)
                    .build();

            SignedJWT signed = new SignedJWT(header, claims);
            signed.sign(new MACSigner(secret));
            return signed.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Failed to sign JWT", e);
        }
    }

    public String generateEmailVerifyToken(String email) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(email)
                    .claim("type", "VERIFY_EMAIL")
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plus(Duration.ofMinutes(15))))
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                    .type(JOSEObjectType.JWT)
                    .build();

            SignedJWT signed = new SignedJWT(header, claims);
            signed.sign(new MACSigner(secret));
            return signed.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Failed to sign email verification token", e);
        }
    }

}