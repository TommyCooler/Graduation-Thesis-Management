package mss.project.accountservice.services;

import mss.project.accountservice.exceptions.AppException;
import mss.project.accountservice.exceptions.ErrorCode;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class OtpServiceImpl implements OtpService {

    private static final int OTP_TTL_SECONDS = 300;          // 5 phút
    private static final int SEND_WINDOW_SECONDS = 360;      // 1 giờ
    private static final int MAX_SENDS_IN_WINDOW = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final SecureRandom random = new SecureRandom();
    private final StringRedisTemplate redis;
    private final MailService mail;

    public OtpServiceImpl(StringRedisTemplate redis, MailService mail) {
        this.redis = redis;
        this.mail = mail;
    }

    @Override
    public void sendOtpToEmail(String email) {
        var ops = redis.opsForValue();

        String keySend = keySend(email);
        Long sends = ops.increment(keySend);
        if (sends != null && sends == 1L) {
            redis.expire(keySend, SEND_WINDOW_SECONDS, TimeUnit.SECONDS);
        }
        if (sends != null && sends > MAX_SENDS_IN_WINDOW) {
            throw new AppException(ErrorCode.MAX_OTP_PER_HOUR);
        }

        // 2) tạo OTP + lưu hash với TTL
        String code = generate6Digits();
        String hash = BCrypt.hashpw(code, BCrypt.gensalt());

        String keyOtp = keyOtp(email);
        String keyAtt = keyAttempts(email);

        ops.set(keyOtp, hash, Duration.ofSeconds(OTP_TTL_SECONDS));
        ops.set(keyAtt, "0", Duration.ofSeconds(OTP_TTL_SECONDS));

        // 3) gửi email
        mail.sendOtpEmail(email, code, OTP_TTL_SECONDS / 60);
    }

    @Override
    public void resendOtp(String email) {
        sendOtpToEmail(email);
    }

    @Override
    public boolean verifyOtp(String email, String code) {
        ValueOperations<String, String> ops = redis.opsForValue();

        String keyOtp = keyOtp(email);
        String keyAtt = keyAttempts(email);

        String storedHash = ops.get(keyOtp);
        if (storedHash == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        int attempts = parseInt(ops.get(keyAtt));
        if (attempts >= MAX_ATTEMPTS) {
            throw new AppException(ErrorCode.MAX_OTP_ATTEMPT);
        }

        boolean ok = BCrypt.checkpw(code, storedHash);
        if (!ok) {
            Long newAttempts = ops.increment(keyAtt);
            if (newAttempts != null && newAttempts == 1L) {
                Long ttl = redis.getExpire(keyOtp, TimeUnit.SECONDS);
                if (ttl != null && ttl > 0) {
                    redis.expire(keyAtt, ttl, TimeUnit.SECONDS);
                }
            }
            return false;
        }

        // đúng → xoá để không dùng lại
        redis.delete(keyOtp);
        redis.delete(keyAtt);

        return true;
    }

    private String generate6Digits() {
        int n = random.nextInt(1_000_000);
        return String.format("%06d", n);
    }
    private int parseInt(String s) {
        try { return s == null ? 0 : Integer.parseInt(s); } catch (NumberFormatException e) { return 0; }
    }
    private String keyOtp(String email)      { return "otp:" + email.toLowerCase(); }
    private String keyAttempts(String email) { return "otp:attempts:" + email.toLowerCase(); }
    private String keySend(String email)     { return "otp:send:" + email.toLowerCase(); }

    public void clearOtpQuotaFor(String email) {
        String e = email.toLowerCase();
        redis.delete(keyOtp(e));
        redis.delete(keyAttempts(e));
        redis.delete(keySend(e));
    }
}
