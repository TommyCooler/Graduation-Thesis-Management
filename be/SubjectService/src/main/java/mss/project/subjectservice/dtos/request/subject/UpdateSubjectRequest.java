package mss.project.subjectservice.dtos.request.subject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSubjectRequest {

    private String subjectName;
    private String subjectCode;
    private String description;
    private int credits;
    private String prerequisites;
    private Long departmentID;
}
