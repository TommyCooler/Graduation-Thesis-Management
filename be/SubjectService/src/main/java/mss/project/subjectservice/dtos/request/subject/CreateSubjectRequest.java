package mss.project.subjectservice.dtos.request.subject;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateSubjectRequest {
    @NotBlank(message = "Subject name is required")
    @Size(min=3, max=50, message = "Subject name must be between 3 and 100 characters")
    private String subjectName;

    @NotBlank(message = "Subject code is required")
    @Size(min=3, max=10, message = "Subject code must be between 3 and 10 characters")
    private String subjectCode;

    private String description;

    @NotNull
    @PositiveOrZero(message = "Credits must be greater than or equal to 0")
    private int credits;

    @NotNull(message = "Prerequisites is required")
    private String prerequisites;

    @NotNull(message = "Department ID is required")
    private Long departmentID;
}
