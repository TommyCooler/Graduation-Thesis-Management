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



    // Review council
    OlD_LECTURER_AND_NEW_LECTURER_SAME(800, "Old lecturer and new lecturer cannot be the same"),
    OLD_LECTURER_IS_NOT_VALID(801, "This lecturer is not a member of the review council"),
    NEW_LECTURER_IS_NOT_VALID(802, "This lecturer is already a member of the review council"),
    MILESTONE_NOT_VALID(803, "Mốc review không hợp lệ"),
    MEMBER_CANNOT_BE_SUPERVISOR(804, "Thành viên hội đồng không thể là người hướng dẫn đề tài"),
    PREVIOUS_REVIEW_COUNCIL_NOT_FOUND(805, "Không tìm thấy hội đồng review trước đó"),
    MEMBER_NOT_VALID(806, "Thành viên hội đồng không hợp lệ"),
    REVIEW_COUNCIL_NOT_FOUND(807, "Không tìm thấy hội đồng review"),
    REVIEW_COUNCIL_MEMBERS_NOT_FOUND(808, "Không tìm thấy thành viên hội đồng review"),
    ;
    private int code;
    private String message;

}
