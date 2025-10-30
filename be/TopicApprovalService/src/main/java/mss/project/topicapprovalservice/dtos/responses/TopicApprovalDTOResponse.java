package mss.project.topicapprovalservice.dtos.responses;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicApprovalDTOResponse {
    private Long id;
    private Long topicId;
    private String approverEmail;
    private String approverName;
    private LocalDateTime approvedAt;
    private String comment;
}
