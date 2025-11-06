package mss.project.checkplagiarismservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlagiarismReportRequest {
    
    @JsonProperty("payloads")
    private List<PayloadItem> payloads;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayloadItem {
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("metadata")
        private Metadata metadata;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        @JsonProperty("topic_id")
        private Long topicId;
        
        @JsonProperty("file_url")
        private String fileUrl;
    }
}

