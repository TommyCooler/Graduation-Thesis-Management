package mss.project.topicapprovalservice.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum ErrorCode {
    TOPICS_NOT_FOUND(404, "Topics not found"),
    ACCOUNT_NOT_FOUND(404, "Account not found"),
    INVALID_TOPIC_STATUS(400, "Invalid topic status"),
    UNAUTHORIZED_ACCESS(403, "Unauthorized access"),
    ;
    private int code;
    private String message;

}
