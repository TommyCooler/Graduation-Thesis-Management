package mss.project.accountservice.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {
    private final JavaMailSender mailSender;

    public MailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = "http://localhost:8081/api/auth/verify?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String htmlContent = """
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto;
                                border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
                    
                        <div style="background-color: #ff6600; padding: 16px 24px; text-align: center;">
                            <img src="https://icolor.vn/wp-content/uploads/2024/08/logo-fpt-04.jpg"
                                 alt="FPT Logo"
                                 style="width: 120px; height: auto; margin-bottom: 8px;">
                            <h2 style="margin: 8px 0 0 0; color: white; font-weight: 600; font-size: 22px;">
                                XÁC THỰC TÀI KHOẢN CỦA BẠN
                            </h2>
                        </div>
                    
                        <div style="padding: 28px 24px; font-size: 15px; color: #333333; line-height: 1.6;">
                            <p>Xin chào,</p>
                            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Hệ thống Graduation-Thesis-Management</strong>.</p>
                            <p>Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn và hoàn tất quá trình đăng ký:</p>
                    
                            <div style="text-align: center; margin: 36px 0;">
                                <a href="%s"
                                   style="background-color: #ff6600; color: white; padding: 14px 28px;
                                          text-decoration: none; border-radius: 6px; font-weight: bold;
                                          display: inline-block; font-size: 16px;">
                                    XÁC THỰC NGAY
                                </a>
                            </div>
                    
                            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                            <p>Trân trọng,<br><strong>Đội ngũ Hỗ trợ FPT</strong></p>
                        </div>
                    
                        <div style="background-color: #f5f5f5; color: #777; text-align: center;
                                    padding: 14px; font-size: 13px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 4px 0;">© 2025 FPT Corporation. All rights reserved.</p>
                            <p style="margin: 0;">Email này được gửi tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                    """.formatted(verifyUrl);

            helper.setTo(to);
            helper.setSubject("Xác thực tài khoản của bạn");
            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email xác thực", e);
        }
    }
}

