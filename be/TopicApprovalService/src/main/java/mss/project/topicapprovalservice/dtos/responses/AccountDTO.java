package mss.project.topicapprovalservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountDTO {
    private  Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
}
