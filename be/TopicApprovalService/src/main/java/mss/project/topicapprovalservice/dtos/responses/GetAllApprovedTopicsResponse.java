package mss.project.topicapprovalservice.dtos.responses;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetAllApprovedTopicsResponse {

    private Long topicID;
    private String topicTitle;
    private String description;
    private String topicStatus;
}
