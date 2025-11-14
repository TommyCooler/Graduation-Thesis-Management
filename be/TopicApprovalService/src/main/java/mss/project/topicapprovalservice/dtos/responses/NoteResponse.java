package mss.project.topicapprovalservice.dtos.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NoteResponse {

    private String Note;
    private String accountName;
}
