package mss.project.checkplagiarismservice.dtos.response;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicDTO {

    private Long id;

    private String title;

    private String description;

    private LocalDateTime submittedAt;

    private String status;

    private String filePathUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
