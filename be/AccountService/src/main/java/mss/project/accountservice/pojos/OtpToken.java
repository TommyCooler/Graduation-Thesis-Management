package mss.project.accountservice.pojos;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "otp_tokens", indexes = {
        @Index(name = "idx_otp_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String email;

    @Column(nullable=false)
    private String codeHash;       // Lưu dạng hash (BCrypt)

    @Column(nullable=false)
    private Instant expiresAt;     // Hết hạn (vd 5 phút)

    @Column(nullable=false)
    private int attempts;          // Số lần nhập sai

    @Column(nullable=false)
    private int sendsInWindow;     // Số lần gửi trong khung thời gian

    @Column(nullable=false)
    private Instant windowResetAt; // Mốc reset đếm gửi (vd sau 1h)

    @Column(nullable=false)
    private boolean used = false;  // Đã dùng thành công chưa

}