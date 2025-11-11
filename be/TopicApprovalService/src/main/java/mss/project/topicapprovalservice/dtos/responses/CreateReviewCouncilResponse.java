package mss.project.topicapprovalservice.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mss.project.topicapprovalservice.enums.Milestone;
import mss.project.topicapprovalservice.enums.ReviewFormat;
import mss.project.topicapprovalservice.enums.Status;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateReviewCouncilResponse {

    private Long councilID;
    private String councilName;
    private Long topicID;
    private Milestone milestone;
    private LocalDateTime reviewDate;
    private String status;
    private String result;
    private LocalDateTime createdAt;
    private ReviewFormat reviewFormat;
    private String meetingLink;
    private String roomNumber;
    private List<Long> lecturerAccountIds;
}
