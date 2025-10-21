package mss.project.topicapprovalservice.dtos.responses;

import lombok.Data;
import mss.project.topicapprovalservice.enums.Status;

import java.util.List;

@Data
public class CouncilResponse {

    private Long id;
    private String councilName;
    private String semester;
    private String date;
    private Status status;
    private int slot;
    private List<CouncilMemberResponse> councilMembers;
    private String topicName;
}
