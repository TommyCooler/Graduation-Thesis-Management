package mss.project.topicapprovalservice.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GiveCommentResponse {
    private Long accountID;
    private String overallComments;
}
