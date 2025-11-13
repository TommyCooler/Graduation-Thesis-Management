package mss.project.accountservice.dtos.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequest {
    private String idToken;
}
