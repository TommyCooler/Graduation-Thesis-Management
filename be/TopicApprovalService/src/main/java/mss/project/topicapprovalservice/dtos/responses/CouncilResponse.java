package mss.project.topicapprovalservice.dtos.responses;

import lombok.Builder;
import lombok.Data;
import mss.project.topicapprovalservice.enums.Status;
import mss.project.topicapprovalservice.pojos.Topics;

import java.util.List;

@Data
@Builder
public class CouncilResponse {

    private Long id;
    private String councilName;
    private String semester;
    private String date;
    private String retakeDate;
    private Status status;
    private List<CouncilMemberResponse> councilMembers;
    private List<TopicsDTOResponse> topic;
}
