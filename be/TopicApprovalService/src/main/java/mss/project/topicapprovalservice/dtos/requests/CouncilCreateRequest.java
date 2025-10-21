package mss.project.topicapprovalservice.dtos.requests;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CouncilCreateRequest {


    private String semester;

    private LocalDate date;

    private Long topicId;
}
