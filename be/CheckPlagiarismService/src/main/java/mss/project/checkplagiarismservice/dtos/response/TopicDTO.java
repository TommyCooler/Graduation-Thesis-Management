package mss.project.checkplagiarismservice.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicDTO {

    private Long id;

    private String title;

    private String description;

    private String submitedAt;

    private String status;

    private String filePathUrl;

    private String createdAt;

    private String updatedAt;
}
