package mss.project.topicapprovalservice.dtos.responses;


import lombok.Builder;
import lombok.Data;
import mss.project.topicapprovalservice.enums.Role;
import mss.project.topicapprovalservice.enums.Status;

import java.time.LocalTime;

@Data
@Builder
public class CouncilSummaryResponse {

    private Role role;
    private String councilName;
    private String semester;
    private String defenseDate;
    private Status status;
    private String topicsTitle;
    private String topicsDescription;
    private String fileUrl;
    private LocalTime defenseTime;
}
