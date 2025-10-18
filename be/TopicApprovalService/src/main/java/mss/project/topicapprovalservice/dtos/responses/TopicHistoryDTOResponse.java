package mss.project.topicapprovalservice.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicHistoryDTOResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String changedContent;
    private String updatedBy;
    private LocalDateTime updatedAt;
    private String actionType;
}