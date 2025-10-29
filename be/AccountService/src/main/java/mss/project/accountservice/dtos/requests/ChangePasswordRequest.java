package mss.project.accountservice.dtos.requests;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {
    private String email;
    private String newPassword;
}
