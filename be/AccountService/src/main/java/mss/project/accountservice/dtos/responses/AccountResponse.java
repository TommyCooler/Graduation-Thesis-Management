package mss.project.accountservice.dtos.responses;

import jakarta.persistence.Column;
import lombok.*;
import mss.project.accountservice.enums.Role;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
}
