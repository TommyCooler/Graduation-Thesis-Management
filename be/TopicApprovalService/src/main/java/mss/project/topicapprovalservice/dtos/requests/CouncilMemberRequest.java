package mss.project.topicapprovalservice.dtos.requests;

import lombok.Data;
import mss.project.topicapprovalservice.enums.Role;

@Data
public class CouncilMemberRequest {

    private Long accountId;

    private Long councilId;

    private String role;
}
