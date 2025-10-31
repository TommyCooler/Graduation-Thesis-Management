package mss.project.checkplagiarismservice.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class N8nResponse {

    @JsonProperty
    String fileUrl;

    @JsonProperty
    Map<?, ?> n8n;
}
