package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.dtos.request.UpdateTopicFileUrlRequest;
import mss.project.checkplagiarismservice.dtos.response.N8nResponse;
import mss.project.checkplagiarismservice.dtos.response.TopicDTO;
import mss.project.checkplagiarismservice.repositories.PlagiarismRepository;
import reactor.core.publisher.Mono;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.codec.multipart.FilePart;

import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class PlagiarismService {

    @Autowired
    private PlagiarismRepository plagiarismRepository;

    @Autowired
    private S3AsyncClient s3AsyncClient;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Autowired
    private WebClient n8nWebClient;

    @Value("${n8n.ingest-path}")
    private String ingestPath;

    @Value("${n8n.token}")
    private String ingestToken;

    @Autowired
    private TopicService topicService;

    public Mono<N8nResponse> checkPlagiarism(FilePart file, String prefix, Long topicId) {
        String safePrefix = (prefix == null || prefix.isBlank()) ? "" :
                (prefix.endsWith("/") ? prefix : prefix + "/");

        String fileName = Objects.requireNonNullElse(file.filename(), "file.bin");
        String key = safePrefix + fileName;

        // Convert FilePart to byte array reactively
        return DataBufferUtils.join(file.content())
                .flatMap(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    dataBuffer.read(bytes);
                    DataBufferUtils.release(dataBuffer);
                    
                    // Upload to S3 async
                    return Mono.fromFuture(() -> 
                        s3AsyncClient.putObject(
                            PutObjectRequest.builder()
                                    .bucket(bucketName)
                                    .key(key)
                                    .contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                                    .build(),
                            AsyncRequestBody.fromBytes(bytes)
                        )
                    ).map(putObjectResponse -> bytes);
                })
                .flatMap(bytes -> {
                    // Get S3 URL
                    String url = String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
                    
                    // Update topic với file URL nếu topicId được cung cấp
                    Mono<Void> updateTopicMono = Mono.empty();
                    if (topicId != null) {
                        updateTopicMono = Mono.fromCallable(() -> {
                            try {
                                TopicDTO existingTopic = topicService.getTopicById(topicId);
                                
                                UpdateTopicFileUrlRequest updateRequest = new UpdateTopicFileUrlRequest();
                                updateRequest.setTitle(existingTopic.getTitle());
                                updateRequest.setDescription(existingTopic.getDescription());
                                updateRequest.setStatus(existingTopic.getStatus());
                                updateRequest.setSubmitedAt(existingTopic.getSubmittedAt() != null 
                                    ? existingTopic.getSubmittedAt().toString() 
                                    : null);
                                updateRequest.setFilePathUrl(url);
                                
                                topicService.updateTopic(topicId, updateRequest);
                                return null;
                            } catch (Exception e) {
                                System.err.println("Failed to update topic with file URL: " + e.getMessage());
                                return null;
                            }
                        }).then();
                    }
                    
                    // Tạo payload để gửi lên n8n via GET with query parameters
                    return updateTopicMono.then(
                        n8nWebClient.get()
                                .uri(uriBuilder -> uriBuilder
                                    .path(ingestPath)
                                    .queryParam("topicId", topicId)
                                    .queryParam("fileUrl", url)
                                    .build())
                                .header("X-INGEST-TOKEN", ingestToken)
                                .retrieve()
                                .onStatus(HttpStatusCode::isError, r -> r.createException().flatMap(Mono::error))
                                .bodyToMono(Map.class)
                                .map(n8nResp -> new N8nResponse(url, n8nResp))
                    );
                });
    }

}
