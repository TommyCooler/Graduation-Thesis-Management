package mss.project.topicapprovalservice.dtos.responses;


import lombok.Data;
import mss.project.topicapprovalservice.enums.Role;

@Data
public class CouncilMemberResponse {

    private Long id;
    private Role role;
    private Long accountId;
    private String fullName;
    private String email;
    private String phoneNumber;
}
