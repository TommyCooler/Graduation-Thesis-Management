package mss.project.accountservice.dtos.responses;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountPerPageResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
    private boolean isActive;
    private Date createdAt;
}
