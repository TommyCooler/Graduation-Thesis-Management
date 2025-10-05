package mss.project.accountservice.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mss.project.accountservice.enums.Role;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "INVALID_NAME")
    @Size(min = 6, max = 50, message = "INVALID_NAME")
    private String name;

    @Email(message = "INVALID_EMAIL")
    private String email;

    @Size(min = 6, message = "WEAK_PASSWORD")
    private String password;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "INVALID_PHONE_NUMBER")
    private String phoneNumber;

}
