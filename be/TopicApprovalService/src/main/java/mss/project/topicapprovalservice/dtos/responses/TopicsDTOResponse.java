package mss.project.topicapprovalservice.dtos.responses;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class TopicsDTOResponse {

    private Long id;
    private String title;
    private String description;
    private String submitedAt;
    private LocalTime defenseTime;
    private String status;
    private String filePathUrl;
    private String createdBy;
    private String createdAt;
    private String updatedAt;
}
