package mss.project.checkplagiarismservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;   // "success" | "error"
    private String message;

    @JsonProperty("data")    // JSON key sẽ là "data"
    private T data;
}
