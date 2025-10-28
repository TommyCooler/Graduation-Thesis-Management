package mss.project.topicapprovalservice.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountTopicsDTOResponse {
    private Long id;
    private Long topicId;
    private Long accountId;
    private String accountName;
    private String role;
}