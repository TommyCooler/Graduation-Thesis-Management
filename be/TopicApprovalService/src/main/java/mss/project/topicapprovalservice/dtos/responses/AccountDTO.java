package mss.project.topicapprovalservice.dtos.responses;

import lombok.Data;

@Data
public class AccountDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String role;
    private boolean isActive;
    private String createdAt;
    private String updatedAt;
}
