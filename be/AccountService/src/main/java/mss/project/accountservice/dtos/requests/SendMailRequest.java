package mss.project.accountservice.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMailRequest {
    @NotBlank
    @Email(message = "INVALID_EMAIL")
    String email;
}
