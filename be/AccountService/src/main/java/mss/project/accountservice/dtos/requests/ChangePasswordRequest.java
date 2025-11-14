package mss.project.accountservice.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {
    private String email;
    @Size(min = 6, message = "WEAK_PASSWORD")
    private String newPassword;
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "INVALID_PHONE_NUMBER")
    private String phoneNumber;
    @NotBlank(message = "INVALID_NAME")
    @Size(min = 6, max = 50, message = "INVALID_NAME")
    private String name;
}
