package mss.project.accountservice.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    @Override
    public void sendOtpEmail(String to, String code, int expiryMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin:auto;
                            border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; background:#fff;">
                  <div style="background:#ff6600; padding:16px 24px; text-align:center; color:white;">
                    <h2 style="margin:0; font-size:20px; font-weight:700;">M&Atilde; X&Aacute;C TH&#7920;C OTP</h2>
                  </div>
                  <div style="padding:24px; color:#333; font-size:15px; line-height:1.6;">
                    <p>Xin ch&agrave;o,</p>
                    <p>M&atilde; x&aacute;c thực của bạn l&agrave;:</p>
                    <div style="text-align:center; margin:24px 0;">
                      <div style="display:inline-block; font-size:28px; letter-spacing:6px; 
                                  border:1px dashed #ff6600; padding:12px 20px; border-radius:8px;">
                        <strong>%s</strong>
                      </div>
                    </div>
                    <p>M&atilde; sẽ hết hạn sau <strong>%d ph&uacute;t</strong>. 
                       Vui l&ograve;ng kh&ocirc;ng chia sẻ m&atilde; cho bất kỳ ai.</p>
                    <p>Nếu bạn kh&ocirc;ng yêu cầu h&agrave;nh động n&agrave;y, h&atilde;y bỏ qua email.</p>
                    <p>Tr&acirc;n trọng,<br><strong>Đội ngũ Hỗ trợ</strong></p>
                  </div>
                  <div style="background:#f5f5f5; color:#777; text-align:center; padding:12px; font-size:13px;">
                    <p style="margin:4px 0;">© 2025 FPT Corporation. All rights reserved.</p>
                    <p style="margin:0;">Email tự động, vui l&ograve;ng kh&ocirc;ng trả lời.</p>
                  </div>
                </div>
            """.formatted(code, expiryMinutes);

            helper.setTo(to);
            helper.setSubject("Mã OTP xác thực email");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email OTP", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        try {
            final String url = "http://localhost:3000/auth/forgot-password?token="
                    + URLEncoder.encode(token, StandardCharsets.UTF_8);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String html = """
            <div style="font-family:'Segoe UI',Arial,sans-serif; max-width:600px; margin:auto;
                        border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; background:#fff;">
              <div style="background:#ff6600; padding:16px 24px; text-align:center; color:#fff;">
                <h2 style="margin:0; font-size:22px; font-weight:700;">ĐẶT LẠI MẬT KHẨU</h2>
              </div>
              <div style="padding:24px; color:#333; font-size:15px; line-height:1.6;">
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Nhấn vào nút bên dưới để tiếp tục đặt lại mật khẩu:</p>

                <div style="text-align:center; margin:28px 0;">
                  <a href="%s"
                     style="background:#ff6600; color:#fff; padding:12px 24px; text-decoration:none;
                            border-radius:6px; font-weight:700; display:inline-block; font-size:16px;">
                    ĐẶT LẠI MẬT KHẨU
                  </a>
                </div>

                <p>Nếu bạn không yêu cầu hành động này, hãy bỏ qua email.</p>
                <p>Trân trọng,<br><strong>Đội ngũ Hỗ trợ</strong></p>
              </div>
              <div style="background:#f5f5f5; color:#777; text-align:center; padding:12px; font-size:13px;">
                <p style="margin:4px 0;">© 2025 FPT Corporation. All rights reserved.</p>
                <p style="margin:0;">Email tự động, vui lòng không trả lời.</p>
              </div>
            </div>
        """.formatted(url);

            helper.setTo(to);
            helper.setSubject("Hướng dẫn đặt lại mật khẩu");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu", e);
        }
    }

}

