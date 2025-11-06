package mss.project.checkplagiarismservice.services;

import lombok.extern.slf4j.Slf4j;
import mss.project.checkplagiarismservice.dtos.request.PlagiarismReportRequest;
import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.dtos.response.TopicDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;

@Service
@Slf4j
public class PlagiarismServiceImpl implements PlagiarismService {

    private final WebClient n8nWebClient;
    private final S3Service s3Service;
    private final TopicService topicService;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Value("${n8n.ingest-path}")
    private String ingestPath;

    @Value("${n8n.token}")
    private String ingestToken;

    @Value("${folder.prefix}")
    private String prefix;

    // Constructor injection thay vì @Autowired
    public PlagiarismServiceImpl(
            WebClient n8nWebClient,
            S3Service s3Service,
            TopicService topicService) {
        this.n8nWebClient = n8nWebClient;
        this.s3Service = s3Service;
        this.topicService = topicService;
    }

    @Override
    public Mono<Boolean> sendDataToN8n(FilePart file, Long topicId) {
        // Validate inputs
        if (file == null) {
            log.error("File is null");
            return Mono.error(new IllegalArgumentException("File is required and cannot be empty"));
        }
        
        if (topicId == null) {
            log.error("TopicId is null");
            return Mono.error(new IllegalArgumentException("TopicId is required"));
        }

        log.info("Starting file processing - Topic ID: {}, Filename: {}", topicId, file.filename());

        // Upload file to S3
        return s3Service.uploadFileAndGetUrl(file, prefix)
                .doOnNext(url -> log.info("File uploaded successfully to S3: {}", url))
                .doOnError(e -> log.error("Failed to upload file to S3: {}", e.getMessage()))
                
                // Update topic with file URL
                .flatMap(url -> updateTopicWithFileUrl(topicId, url)
                        .doOnSuccess(topic -> log.info("Topic {} updated with file URL", topicId))
                        .doOnError(e -> log.error("Failed to update topic {}: {}", topicId, e.getMessage()))
                        .thenReturn(url))
                
                // Call N8N webhook
                .flatMap(url -> callN8nWebhook(topicId, url))
                
                .doOnSuccess(result -> log.info("Successfully completed processing for topic: {}", topicId))
                .doOnError(e -> log.error("Error processing file for topic {}: {}", topicId, e.getMessage(), e))
                
                // Map errors to RuntimeException with context
                .onErrorMap(e -> {
                    String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                    return new RuntimeException("Error sending file to N8N: " + errorMsg, e);
                });
    }

    /**
     * Update topic with file URL
     */
    private Mono<ApiResponse<TopicDTO>> updateTopicWithFileUrl(Long topicId, String fileUrl) {
        return Mono.fromCallable(() -> {
            log.info("Fetching topic {} to update file URL: {}", topicId, fileUrl);
            
            // Get current topic
            ApiResponse<TopicDTO> response = topicService.getTopicById(topicId);
            
            if (response == null || response.getData() == null) {
                log.error("Topic not found with ID: {}", topicId);
                throw new RuntimeException("Topic not found with ID: " + topicId);
            }
            
            TopicDTO topic = response.getData();
            
            // Đảm bảo chỉ update filePathUrl, giữ nguyên các trường khác
            log.info("Current topic filePathUrl: {}, updating to: {}", topic.getFilePathUrl(), fileUrl);
            topic.setFilePathUrl(fileUrl);
            
            // Update topic - return ApiResponse instead of TopicDTO
            ApiResponse<TopicDTO> updateResponse = topicService.updateTopic(topicId, topic);
            
            if (updateResponse == null || updateResponse.getData() == null) {
                log.error("Failed to update topic with ID: {}", topicId);
                throw new RuntimeException("Failed to update topic with ID: " + topicId);
            }
            
            log.info("Successfully updated topic {} with filePathUrl: {}", 
                    topicId, updateResponse.getData().getFilePathUrl());
            
            return updateResponse;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .timeout(Duration.ofSeconds(10))
        .doOnError(e -> log.error("Error updating topic {}: {}", topicId, e.getMessage(), e));
    }
    /**
     * Call N8N webhook to trigger plagiarism check
     */
    private Mono<Boolean> callN8nWebhook(Long topicId, String url) {
        log.debug("Calling N8N webhook - Topic: {}, URL: {}", topicId, url);
        
        return n8nWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(ingestPath)
                        .queryParam("topicId", topicId)
                        .queryParam("fileUrl", url)
                        .build())
                .header("X-INGEST-TOKEN", ingestToken)
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(30))
                .thenReturn(true)
                .doOnSuccess(v -> log.info("N8N webhook called successfully for topic: {}", topicId))
                .onErrorResume(e -> {
                    log.error("Failed to call N8N webhook for topic {}: {}", topicId, e.getMessage(), e);
                    return Mono.error(new RuntimeException("N8N webhook failed: " + e.getMessage(), e));
                });
    }

    /**
     * Process plagiarism report from N8N
     */
    @Override
    public void processPlagiarismReport(PlagiarismReportRequest reportRequest) {
        if (reportRequest == null || reportRequest.getPayloads() == null || reportRequest.getPayloads().isEmpty()) {
            log.warn("Received empty or null plagiarism report");
            return;
        }

        log.info("Received plagiarism report with {} payload(s)", reportRequest.getPayloads().size());

        for (PlagiarismReportRequest.PayloadItem payload : reportRequest.getPayloads()) {
            if (payload.getMetadata() == null) {
                log.warn("Payload item missing metadata, skipping");
                continue;
            }

            Long topicId = payload.getMetadata().getTopicId();
            String fileUrl = payload.getMetadata().getFileUrl();
            String content = payload.getContent();

            if (topicId == null) {
                log.warn("Payload item missing topic_id, skipping");
                continue;
            }

            log.info("Processing plagiarism report for topic ID: {}, file URL: {}", topicId, fileUrl);
            log.debug("Content length: {} characters", content != null ? content.length() : 0);

            // TODO: Store plagiarism results in database or process further
            // For now, just log the information
            // You can add database operations here later to store the plagiarism check results
        }

        log.info("Finished processing plagiarism report");
    }
}

