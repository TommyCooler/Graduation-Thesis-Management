package mss.project.accountservice.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public enum ErrorCode {
    ACCOUNT_NOT_FOUND(404, "Không tìm thấy tài khoản"),
    INVALID_PASSWORD(400, "Mật khẩu không chính xác"),
    ACCOUNT_INACTIVE(403, "Tài khoản của bạn đã bị vô hiệu hóa"),
    EMAIL_ALREADY_EXISTS(400, "Email đã được sử dụng"),
    INVALID_EMAIL(400, "Địa chỉ email không hợp lệ"),
    INVALID_NAME(400, "Tên phải có độ dài từ 6 đến 50 ký tự"),
    INVALID_PHONE_NUMBER(400, "Số điện thoại không hợp lệ"),
    WEAK_PASSWORD(400, "Mật khẩu phải có ít nhất 6 ký tự"),
    TOKEN_EXPIRED(401, "Token đã hết hạn"),
    INVALID_TOKEN(401, "Token không hợp lệ");
    ;
    private int code;
    private String message;

}
