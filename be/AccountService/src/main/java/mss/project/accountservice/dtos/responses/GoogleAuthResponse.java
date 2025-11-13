package mss.project.accountservice.dtos.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class GoogleAuthResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
}
