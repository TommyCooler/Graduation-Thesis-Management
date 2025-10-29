package mss.project.checkplagiarismservice.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTopicFileUrlRequest {

    private String title;
    private String description;
    private String submitedAt;
    private String status;
    private String filePathUrl;

}

