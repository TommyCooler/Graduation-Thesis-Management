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
    TOPIC_ALREADY_ASSIGNED_TO_COUNCIL(400, "Topic has already been assigned to a review council"),
    REVIEW_COUNCIL_NOT_APPROVED(400, "Review council has not approved the topic"),



    // Review council
    LECTURER_IS_NOT_MEMBER(801, "This lecturer is not a member of this review council"),
    NEW_LECTURER_IS_NOT_VALID(802, "This lecturer is already a member of the review council"),
    MILESTONE_NOT_VALID(803, "Mốc review không hợp lệ"),
    MEMBER_CANNOT_BE_SUPERVISOR(804, "Thành viên hội đồng không thể là người hướng dẫn đề tài"),
    PREVIOUS_REVIEW_COUNCIL_NOT_FOUND(805, "Không tìm thấy hội đồng review của mốc trước đó"),
    MEMBER_NOT_VALID(806, "Thành viên hội đồng phải gồm 1 giảng viên đã review và 1 giảng viên chưa review đề tài"),
    REVIEW_COUNCIL_NOT_FOUND(807, "Không tìm thấy hội đồng review"),
    REVIEW_COUNCIL_MEMBERS_NOT_FOUND(808, "Không tìm thấy thành viên hội đồng review"),
    REVIEW_DATE_FOR_WEEK_4_NOT_FOUND(809,"Ngày review cho tuần 4 không được để trống"),
    REVIEW_DATE_FOR_WEEK_8_12_IS_AUTO_CALCULATED(809,"Ngày review cho tuần 8 và tuần 12 được tính tự động"),
    REVIEW_COUNIL_FOR_THIS_WEEK_ALREADY_EXIST(810, "Hội đồng review cho tuần này đã tồn tại"),
    NAME_OF_REVIEW_COUNCIL_ALREADY_EXIST(811,"Tên hội đồng đã tồn tại"),
    MEETING_LINK_IS_NOT_VALID(812,"Meeting link không hợp lệ"),
    ROOM_NUMBER_IS_NOT_VALID(813,"Số phòng không hợp lệ"),
    STATUS_OF_PREVIOS_COUNCIL_NOT_VALID(814, "Trạng thái của đề tài ở mốc trước đó phải là Đạt"),
    STATUS_OF_COUNCIL_IS_NOT_PLANNED(815,"Mốc review này đã được chấm"),
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
    TOPIC_ALREADY_APPROVED(400, "You have already approved this topic"),
    CANNOT_APPROVE_OWN_TOPIC(403, "Người tạo và người tham gia đề tài không được duyệt đề tài của mình"),
    CANNOT_EDIT_TOPIC(403, "Bạn không có quyền chỉnh sửa đề tài này. Chỉ người tạo và người tham gia mới được chỉnh sửa"),
    USER_NOT_FOUND_IN_TOPIC(404, "Người dùng không phải là thành viên của đề tài này"),
    CANNOT_REMOVE_CREATOR(403, "Không thể xóa chủ nhiệm đề tài"),
    ;
    private int code;
    private String message;

}
