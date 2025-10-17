package mss.project.accountservice.services;

public interface OtpService {
    void sendOtpToEmail(String email);
    void resendOtp(String email);
    boolean verifyOtp(String email, String code);
}
