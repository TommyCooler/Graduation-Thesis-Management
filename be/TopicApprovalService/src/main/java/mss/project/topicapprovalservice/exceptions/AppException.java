package mss.project.topicapprovalservice.exceptions;

import lombok.Getter;
import lombok.Setter;
import mss.project.topicapprovalservice.exceptions.ErrorCode;

@Getter
@Setter
public class AppException extends RuntimeException {
    private ErrorCode errorCode;
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

}
