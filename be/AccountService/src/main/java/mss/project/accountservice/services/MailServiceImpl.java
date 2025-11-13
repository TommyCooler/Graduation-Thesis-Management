package mss.project.accountservice.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class MailServiceImpl implements MailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${resend.apiKey}")
    private String apiKey;

    @Value("${resend.from}")
    private String fromEmail; // ví dụ: "Support <no-reply@yourdomain.com>"


    // ============ PUBLIC APIS ============

    @Override
    public void sendVerificationEmail(String to, String token) {
        // giữ logic cũ (chỉ đổi sang Resend)
        String verifyUrl = "http://localhost:8081/api/auth/verify?token=" + urlEncode(token);
        String subject = "Xác thực tài khoản của bạn";
        String html = buildVerifyHtml(verifyUrl);
        sendHtmlViaResend(to, subject, html);
    }

    @Override
    public void sendOtpEmail(String to, String code, int expiryMinutes) {
        String subject = "Mã OTP xác thực email";
        String html = buildOtpHtml(code, expiryMinutes);
        sendHtmlViaResend(to, subject, html);
    }

    @Override
    public void sendPasswordResetEmail(String to, String token) {
        final String url = "http://localhost:3000/auth/forgot-password?token=" + urlEncode(token);
        String subject = "Hướng dẫn đặt lại mật khẩu";
        String html = buildResetHtml(url);
        sendHtmlViaResend(to, subject, html);
    }

    @Override
    public void sendAccountProvisionEmail(String to, String tempPassword) {
        String subject = "Thông tin tài khoản mới được tạo";
        String html = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto;
                        border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #ff6600; padding: 16px 24px; text-align: center;">
                    <h2 style="margin: 8px 0 0 0; color: white; font-weight: 600; font-size: 22px;">
                        THÔNG TIN TÀI KHOẢN MỚI
                    </h2>
                </div>

                <div style="padding: 28px 24px; font-size: 15px; color: #333333; line-height: 1.6;">
                    <p>Xin chào,</p>
                    <p>Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập tạm thời của bạn:</p>

                    <ul>
                        <li><strong>Email:</strong> %s</li>
                        <li><strong>Mật khẩu tạm thời:</strong> %s</li>
                    </ul>

                    <p>Vui lòng đăng nhập và thay đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật tài khoản.</p>
                    <p>Trân trọng,<br><strong>Đội ngũ Hỗ trợ FPT</strong></p>
                </div>

                <div style="background-color: #f5f5f5; color: #777; text-align: center;
                            padding: 14px; font-size: 13px; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 4px 0;">© 2025 FPT Corporation. All rights reserved.</p>
                    <p style="margin: 0;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            </div>
        """.formatted(to, tempPassword);
        sendHtmlViaResend(to, subject, html);
    }

    @Override
    public void sendTopicApprovedEmail(String to, String topicTitle, String topicId) {
        String subject = "Đề tài của bạn đã được duyệt";
        String html = buildTopicApprovedHtml(topicTitle, topicId);
        sendHtmlViaResend(to, subject, html);
    }

    // ============ RESEND CORE ============

    private void sendHtmlViaResend(String to, String subject, String htmlContent) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromEmail);
            payload.put("to", new String[]{to});
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails", request, String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Gửi email thất bại (Resend): " + response.getBody());
            }
        } catch (Exception e) {
            // hợp nhất cách ném lỗi giống code JavaMail cũ
            throw new RuntimeException("Không thể gửi email qua Resend", e);
        }
    }

    // ============ HTML BUILDERS (giữ UI cũ) ============

    private String buildVerifyHtml(String verifyUrl) {
        return """
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
                                  display: inline-block; font-size: 16px;">XÁC THỰC NGAY</a>
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
    }

    private String buildOtpHtml(String code, int expiryMinutes) {
        return """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin:auto;
                        border:1px solid #e0e0e0; border-radius:10px; overflow:hidden; background:#fff;">
              <div style="background:#ff6600; padding:16px 24px; text-align:center; color:white;">
                <h2 style="margin:0; font-size:20px; font-weight:700;">MÃ XÁC THỰC OTP</h2>
              </div>
              <div style="padding:24px; color:#333; font-size:15px; line-height:1.6;">
                <p>Xin chào,</p>
                <p>Mã xác thực của bạn là:</p>
                <div style="text-align:center; margin:24px 0;">
                  <div style="display:inline-block; font-size:28px; letter-spacing:6px;
                              border:1px dashed #ff6600; padding:12px 20px; border-radius:8px;">
                    <strong>%s</strong>
                  </div>
                </div>
                <p>Mã sẽ hết hạn sau <strong>%d phút</strong>. Vui lòng không chia sẻ mã cho bất kỳ ai.</p>
                <p>Nếu bạn không yêu cầu hành động này, hãy bỏ qua email.</p>
                <p>Trân trọng,<br><strong>Đội ngũ Hỗ trợ</strong></p>
              </div>
              <div style="background:#f5f5f5; color:#777; text-align:center; padding:12px; font-size:13px;">
                <p style="margin:4px 0;">© 2025 FPT Corporation. All rights reserved.</p>
                <p style="margin:0;">Email tự động, vui lòng không trả lời.</p>
              </div>
            </div>
        """.formatted(code, expiryMinutes);
    }

    private String buildResetHtml(String url) {
        return """
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
    }

    private String buildTopicApprovedHtml(String topicTitle, String topicId) {
        String topicUrl = "http://localhost:3000/topics/" + topicId;
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #667eea; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color: #667eea; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-width: 600px;">
                                
                                <!-- Header with Gradient Background -->
                                <tr>
                                    <td style="background-color: #28a745; padding: 40px 30px; text-align: center;">
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="padding-bottom: 20px;">
                                                    <img src="https://icolor.vn/wp-content/uploads/2024/08/logo-fpt-04.jpg"
                                                         alt="FPT Logo"
                                                         width="100" style="display: block; margin: 0 auto;">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="padding-bottom: 15px;">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.25); border-radius: 50px; margin: 0 auto;">
                                                        <tr>
                                                            <td style="padding: 12px 24px;">
                                                                <span style="font-size: 48px; line-height: 1;">🎉</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center">
                                                    <h1 style="margin: 0; color: #ffffff; font-weight: 700; font-size: 28px; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                                        ĐỀ TÀI ĐÃ ĐƯỢC DUYỆT
                                                    </h1>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="padding-top: 10px;">
                                                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 400; opacity: 0.95;">
                                                        Chúc mừng bạn!
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Content Section -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                                            Xin chào,
                                        </p>
                                        <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.7;">
                                            Chúc mừng! Đề tài của bạn đã được <strong style="color: #28a745;">duyệt thành công</strong> bởi <strong style="color: #28a745;">2/2 người phê duyệt</strong>. Đây là một cột mốc quan trọng trong hành trình tốt nghiệp của bạn.
                                        </p>
                                        
                                        <!-- Topic Info Card -->
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; border: 2px solid #86efac; margin: 30px 0;">
                                            <tr>
                                                <td style="padding: 24px;">
                                                    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="60" valign="top" style="padding-right: 16px;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: #28a745; border-radius: 12px; width: 48px; height: 48px;">
                                                                    <tr>
                                                                        <td align="center" valign="middle">
                                                                            <span style="font-size: 24px;">📋</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                            <td valign="top">
                                                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                    Thông tin đề tài
                                                                </p>
                                                                <p style="margin: 0 0 12px 0; font-size: 18px; color: #166534; font-weight: 700; line-height: 1.4;">
                                                                    %s
                                                                </p>
                                                                <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #86efac; border-radius: 6px;">
                                                                    <tr>
                                                                        <td style="padding: 6px 12px;">
                                                                            <span style="font-size: 13px; color: #15803d; font-weight: 600;">
                                                                                Mã đề tài: <span style="color: #166534;">#%s</span>
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Status Badge -->
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                            <tr>
                                                <td align="center">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: #28a745; border-radius: 50px;">
                                                        <tr>
                                                            <td style="padding: 12px 24px;">
                                                                <span style="color: #ffffff; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
                                                                    ✓ ĐÃ DUYỆT THÀNH CÔNG
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 30px 0 20px 0; font-size: 15px; color: #666666; line-height: 1.7;">
                                            Đề tài của bạn đã trải qua quá trình xem xét kỹ lưỡng và được chấp nhận. Bây giờ bạn có thể tiếp tục thực hiện các bước tiếp theo trong quy trình tốt nghiệp.
                                        </p>

                                        <!-- CTA Button -->
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                                            <tr>
                                                <td align="center">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: #28a745; border-radius: 50px;">
                                                        <tr>
                                                            <td align="center" style="padding: 16px 40px;">
                                                                <a href="%s"
                                                                   style="color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; display: inline-block;">
                                                                    🔍 XEM CHI TIẾT ĐỀ TÀI
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Next Steps Box -->
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 4px solid #667eea; border-radius: 8px; margin: 30px 0;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        📌 Bước tiếp theo
                                                    </p>
                                                    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                                        Bạn có thể tiếp tục phát triển đề tài, chuẩn bị cho các buổi báo cáo tiếp theo và hoàn thiện các yêu cầu của quy trình tốt nghiệp.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin: 30px 0 0 0; font-size: 15px; color: #666666; line-height: 1.7;">
                                            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                                        </p>
                                        <p style="margin: 20px 0 0 0; font-size: 15px; color: #333333;">
                                            Trân trọng,<br>
                                            <strong style="color: #28a745; font-size: 16px;">Đội ngũ Hỗ trợ FPT</strong>
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                                            © 2025 <strong style="color: #475569;">FPT Corporation</strong>. All rights reserved.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                            Email này được gửi tự động, vui lòng không trả lời.
                                        </p>
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                            <tr>
                                                <td align="center">
                                                    <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                                                        Hệ thống Quản lý Đề tài Tốt nghiệp - FPT University
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """.formatted(topicTitle, topicId, topicUrl);
    }

    // ============ UTILS ============

    private static String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
