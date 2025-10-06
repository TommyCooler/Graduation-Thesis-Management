package mss.project.accountservice.services;

public interface MailService {
    void sendVerificationEmail(String to, String token);
}
