package mss.project.topicapprovalservice.dtos.requests;

import lombok.Data;

@Data
public class CouncilTopicNoteRequest {

    private Long topicId;

    private Long councilMemberId; // ID của bản ghi CouncilMember

    private String note;
}
