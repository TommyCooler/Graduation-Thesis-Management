package mss.project.accountservice.services;

public interface MailService {
    void sendVerificationEmail(String to, String token);
    void sendOtpEmail(String to, String code, int expiryMinutes);

    void sendPasswordResetEmail(String to, String token);

    void sendAccountProvisionEmail(String to, String tempPassword);
    
    void sendTopicApprovedEmail(String to, String topicTitle, String topicId);
}
