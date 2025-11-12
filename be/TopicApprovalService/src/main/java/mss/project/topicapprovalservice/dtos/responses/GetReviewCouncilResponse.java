package mss.project.topicapprovalservice.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.ReviewFormat;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetReviewCouncilResponse {
    private Long councilID;
    private String councilName;
    private Long topicID;
    private String topicTitle;
    private Milestone milestone;
    private LocalDateTime reviewDate;
    private String status;
    private String result;
    private LocalDateTime createdAt;
    private ReviewFormat reviewFormat;
    private String meetingLink;
    private String roomNumber;
}
