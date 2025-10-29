package mss.project.checkplagiarismservice.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PayloadRequest(
    @JsonProperty("topic_id") Long topicId,
    @JsonProperty("file_url") String fileUrl
) {
}
