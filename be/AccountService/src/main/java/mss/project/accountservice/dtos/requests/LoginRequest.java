package mss.project.accountservice.dtos.requests;

import jakarta.validation.constraints.Email;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @Email(message = "INVALID_EMAIL")
    private String email;
    private String password;
}
