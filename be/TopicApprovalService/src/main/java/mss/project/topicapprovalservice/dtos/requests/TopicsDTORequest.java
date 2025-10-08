package mss.project.topicapprovalservice.dtos.requests;


import lombok.Data;

@Data
public class TopicsDTORequest {

    private String title;
    private String description;
    private String submitedAt;
    private String status;
    private String filePathUrl;
    private String createdAt;
    private String updatedAt;
}
