package mss.project.topicapprovalservice.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CouncilCreateRequest {
    @NotBlank(message = "Semester name is required")
    private String semester;
    private List<Long> topicId;
}
