package mss.project.subjectservice.dtos.response.subject;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetASubjectResponse {
    private Long subjectID;
    private String subjectName;
    private String subjectCode;
    private String description;
    private int credits;
    private String prerequisites;
    private String departmentName;
}
