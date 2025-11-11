package mss.project.topicapprovalservice.dtos.responses;


import lombok.Builder;
import lombok.Data;
import mss.project.topicapprovalservice.enums.Role;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.enums.TopicStatus;

import java.time.LocalTime;

@Data
@Builder
public class CouncilSummaryResponse {

    private Long councilId;
    private Long topicId;
    private Role role;
    private Long councilMemberId;
    private String councilName;
    private String semester;
    private String defenseDate;
    private Status status;
    private TopicStatus topicStatus;
    private String retakeDate;
    private String topicsTitle;
    private String topicsDescription;
    private String fileUrl;
    private LocalTime defenseTime;
}
