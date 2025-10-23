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
    INVALID_SEMESTER(400, "Invalid semester"),
    NOT_ENOUGH_LECTURERS(400, "Not enough lecturers to approve the topic"),
    USER_ALREADY_JOINED_TOPIC(4001, "User has already joined this topic"),
    ACCOUNT_SERVICE_ERROR(500, "Account service error"),

    // New error codes for review council
    TOPIC_NOT_FOUND(404, "Topic not found"),
    COUNCIL_NOT_FOUND(404, "Council not found"),
    CREATOR_CANNOT_JOIN_COUNCIL(403, "Người tạo đề tài không thể tham gia hội đồng duyệt"),
    COUNCIL_FULL(400, "Hội đồng đã đủ 2 thành viên"),
    ALREADY_JOINED_COUNCIL(400, "Bạn đã tham gia hội đồng này rồi"),
    NOT_COUNCIL_MEMBER(400, "Bạn không phải thành viên của hội đồng này"),
    ;
    private int code;
    private String message;

}
