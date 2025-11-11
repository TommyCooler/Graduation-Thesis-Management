package mss.project.topicapprovalservice.dtos.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CouncilTopicNoteResponse {
    private Long id;
    private Long topicId;
    private Long councilMemberId;
    private String councilMemberRole;
    private Long councilId;
    private String note;
    private String createdAt;
    private String updatedAt;
}