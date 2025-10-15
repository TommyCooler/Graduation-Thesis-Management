package mss.project.subjectservice.exceptions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException {
    ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDetailMessage());
        this.errorCode = errorCode;
    }
}
