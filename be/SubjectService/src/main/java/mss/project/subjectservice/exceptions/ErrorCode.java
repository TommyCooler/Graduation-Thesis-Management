package mss.project.subjectservice.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    // Chung
    UNCATEGORIZED(500, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),

    // Subject
    SUBJECT_NAME_ALREADY_EXISTS(501, "Subject name already exists", HttpStatus.CONFLICT),
    SUBJECT_CODE_ALREADY_EXISTS(502, "Subject code already exists", HttpStatus.CONFLICT),
    NO_SUBJECTS_FOUND(503, "No subjects found", HttpStatus.NOT_FOUND),

    // Department
    DEPARTMENT_NAME_ALREADY_EXISTS(601, "Department name already exists", HttpStatus.CONFLICT),
    NO_DEPARTMENTS_FOUND(602, "No departments found", HttpStatus.NOT_FOUND)
    ;

    private int detailCode;
    private String detailMessage;
    private HttpStatus httpCode;
}
