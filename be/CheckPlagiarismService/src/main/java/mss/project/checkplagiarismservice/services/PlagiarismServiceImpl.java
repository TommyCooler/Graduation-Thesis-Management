package mss.project.checkplagiarismservice.services;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import mss.project.checkplagiarismservice.dtos.request.PlagiarismReportRequest;
import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.dtos.response.TopicDTO;
import mss.project.checkplagiarismservice.pojos.PlagiarismResult;
import mss.project.checkplagiarismservice.repositories.PlagiarismResultRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@Transactional
public class PlagiarismServiceImpl implements PlagiarismService {

    private final WebClient n8nWebClient;
    private final WebClient qdrantWebClient;
    private final S3Service s3Service;
    private final TopicService topicService;
    private final PlagiarismResultRepository plagiarismResultRepository;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Value("${n8n.ingest-path}")
    private String ingestPath;

    @Value("${n8n.delete-path}")
    private String deletePath;

    @Value("${n8n.token}")
    private String ingestToken;

    @Value("${folder.prefix}")
    private String prefix;

    @Value("${plagiarism.qdrant.collection:plagiarism-embedding}")
    private String qdrantCollection;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int QDRANT_SCROLL_LIMIT = 1000;
    private static final int QDRANT_RECOMMEND_LIMIT = 5;
    private static final int QDRANT_MAX_ATTEMPTS = 5;
    private static final long QDRANT_RETRY_DELAY_MS = 2000L;

    // Constructor injection thay vì @Autowired
    public PlagiarismServiceImpl(
            @Qualifier("n8nWebClient") WebClient n8nWebClient,
            @Qualifier("qdrantWebClient") WebClient qdrantWebClient,
            S3Service s3Service,
            TopicService topicService, PlagiarismResultRepository plagiarismResultRepository) {
        this.n8nWebClient = n8nWebClient;
        this.qdrantWebClient = qdrantWebClient;
        this.s3Service = s3Service;
        this.topicService = topicService;
        this.plagiarismResultRepository = plagiarismResultRepository;
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

        TopicDTO topicDTO = topicService.getTopicById(topicId).getData();

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
                .flatMap(url -> callN8nWebhook(topicId, url, topicDTO.getDescription()))
                // Fetch plagiarism candidates from Qdrant
                .flatMap(result -> syncPlagiarismResultsFromQdrant(topicId)
                        .thenReturn(result))
                
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
    private Mono<Boolean> callN8nWebhook(Long topicId, String url, String description) {
        log.debug("Calling N8N webhook - Topic: {}, URL: {}", topicId, url);
        
        return n8nWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(ingestPath)
                        .queryParam("topicId", topicId)
                        .queryParam("fileUrl", url)
                        .queryParam("description", description)
                        .build())
//                .header("X-INGEST-TOKEN", ingestToken)
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
    public void processPlagiarismReport(PlagiarismReportRequest reportRequest, Long topicId) {
        if (reportRequest == null || reportRequest.getPayloads() == null || reportRequest.getPayloads().isEmpty()) {
            log.warn("Received empty or null plagiarism report");
            return;
        }

        log.info("Received plagiarism report with {} payload(s)", reportRequest.getPayloads().size());

        List<PlagiarismResult> resultsToSave = new ArrayList<>();
        Long plagiarizedTopicId = null;

        for (PlagiarismReportRequest.PayloadItem payload : reportRequest.getPayloads()) {
            if (payload.getMetadata() == null) {
                log.warn("Payload item missing metadata, skipping");
                continue;
            }

            plagiarizedTopicId = payload.getMetadata().getTopicId();
            String fileUrl = payload.getMetadata().getFileUrl();
            String content = payload.getContent();

            if (topicId == null) {
                log.error("Payload item missing topic_id");
                throw new IllegalArgumentException("Payload item missing topic_id");
            }

            if (fileUrl == null || fileUrl.isEmpty()) {
                log.error("Payload item missing file_url for topic {}", topicId);
                throw new IllegalArgumentException("Payload item missing file_url for topic " + topicId);
            }

            log.info("Processing plagiarism report for topic ID: {}, file URL: {}", topicId, fileUrl);
            log.debug("Content length: {} characters", content != null ? content.length() : 0);

            // Create PlagiarismResult entity
            PlagiarismResult result = PlagiarismResult.builder()
                    .topicId(topicId)
                    .plagiarizedTopicId(plagiarizedTopicId)
                    .plagiarizedContent(content)
                    .plagiarizedFileUrl(fileUrl)
                    .build();

            resultsToSave.add(result);
        }

        // Delete old plagiarism results for this topic before saving new ones
        if (topicId != null && !resultsToSave.isEmpty()) {
            log.info("Deleting old plagiarism results for topic ID: {}", topicId);
            plagiarismResultRepository.deleteByTopicId(topicId);

            // Save all new plagiarism results
            log.info("Saving {} new plagiarism result(s) for topic ID: {}", resultsToSave.size(), topicId);
            plagiarismResultRepository.saveAll(resultsToSave);
            log.info("Successfully saved plagiarism results for topic ID: {}", topicId);
        }

        log.info("Finished processing plagiarism report");
    }

    /**
     * Fetch and persist plagiarism results for a topic directly from Qdrant.
     */
    private Mono<Void> syncPlagiarismResultsFromQdrant(Long topicId) {
        return Mono.fromCallable(() -> {
            if (topicId == null) {
                throw new IllegalArgumentException("TopicId is required");
            }

            List<String> positiveIds = fetchPositivePointIds(topicId);

            if (CollectionUtils.isEmpty(positiveIds)) {
                log.warn("No embeddings found in Qdrant for topic {} after {} attempt(s). Skipping plagiarism persistence.", topicId, QDRANT_MAX_ATTEMPTS);
                plagiarismResultRepository.deleteByTopicId(topicId);
                return Boolean.FALSE;
            }

            List<PlagiarismResult> recommendations = fetchRecommendations(topicId, positiveIds);

            // Update database with new results
            plagiarismResultRepository.deleteByTopicId(topicId);

            if (recommendations.isEmpty()) {
                log.info("No plagiarism candidates returned for topic {}.", topicId);
                return Boolean.FALSE;
            }

            plagiarismResultRepository.saveAll(recommendations);
            log.info("Saved {} plagiarism result(s) for topic {}.", recommendations.size(), topicId);
            return Boolean.TRUE;
        }).subscribeOn(Schedulers.boundedElastic())
                .timeout(Duration.ofSeconds(30))
                .doOnError(e -> log.error("Failed to sync plagiarism results from Qdrant for topic {}: {}", topicId, e.getMessage(), e))
                .then();
    }

    private List<String> fetchPositivePointIds(Long topicId) {
        String scrollPath = buildScrollPath();
        log.info("Using Qdrant collection: {}", qdrantCollection);
        
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("limit", QDRANT_SCROLL_LIMIT);
        requestBody.put("with_payload", List.of("metadata.topic_id", "metadata.chunk_index", "metadata.file_url"));
        requestBody.put("with_vectors", Boolean.FALSE);

        Map<String, Object> matchValue = Map.of("value", topicId);
        Map<String, Object> filterEntry = Map.of("key", "metadata.topic_id", "match", matchValue);
        Map<String, Object> filter = Map.of("must", List.of(filterEntry));
        requestBody.put("filter", filter);

        List<String> positiveIds = new ArrayList<>();
        Exception lastException = null;

        for (int attempt = 1; attempt <= QDRANT_MAX_ATTEMPTS; attempt++) {
            try {
                // Log JSON request body before sending to Qdrant
                try {
                    String jsonRequest = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody);
                    log.info("Sending request to Qdrant (scroll) - Attempt {}/{}:\nCollection: {}\nURL: {}\nRequest Body:\n{}", 
                            attempt, QDRANT_MAX_ATTEMPTS, qdrantCollection, scrollPath, jsonRequest);
                } catch (Exception e) {
                    log.warn("Failed to serialize request body to JSON: {}", e.getMessage());
                }

                JsonNode responseNode = qdrantWebClient.post()
                        .uri(scrollPath)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .timeout(Duration.ofSeconds(10))
                        .block();

                if (responseNode == null) {
                    log.warn("Received null response when fetching embeddings for topic {} (attempt {}/{}).", topicId, attempt, QDRANT_MAX_ATTEMPTS);
                } else {
                    // Log response for debugging
                    try {
                        String jsonResponse = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(responseNode);
                        log.debug("Qdrant response (scroll) - Attempt {}/{}:\n{}", attempt, QDRANT_MAX_ATTEMPTS, jsonResponse);
                    } catch (Exception e) {
                        log.debug("Failed to serialize response to JSON: {}", e.getMessage());
                    }
                    
                    JsonNode pointsNode = responseNode.path("result").path("points");
                    if (pointsNode.isArray()) {
                        pointsNode.forEach(point -> {
                            JsonNode idNode = point.get("id");
                            if (idNode != null && !idNode.isNull()) {
                                String id = idNode.asText();
                                if (StringUtils.hasText(id)) {
                                    positiveIds.add(id);
                                }
                            }
                        });
                    }
                }

                if (!positiveIds.isEmpty()) {
                    log.info("Fetched {} embedding id(s) for topic {} from Qdrant.", positiveIds.size(), topicId);
                    return positiveIds;
                }

                log.info("No embeddings found for topic {} on attempt {}/{}. Retrying after delay...", topicId, attempt, QDRANT_MAX_ATTEMPTS);
            } catch (WebClientResponseException ex) {
                lastException = ex;
                // Log detailed error response from Qdrant
                try {
                    String responseBody = ex.getResponseBodyAsString();
                    log.error("Qdrant error response (scroll) - Attempt {}/{}:\nStatus: {}\nResponse Body: {}", 
                            attempt, QDRANT_MAX_ATTEMPTS, ex.getStatusCode(), responseBody);
                } catch (Exception e) {
                    log.error("Error fetching embeddings for topic {} on attempt {}/{}: {} - Status: {}", 
                            topicId, attempt, QDRANT_MAX_ATTEMPTS, ex.getMessage(), ex.getStatusCode());
                }
            } catch (Exception ex) {
                lastException = ex;
                log.warn("Error fetching embeddings for topic {} on attempt {}/{}: {}", topicId, attempt, QDRANT_MAX_ATTEMPTS, ex.getMessage());
            }

            try {
                Thread.sleep(QDRANT_RETRY_DELAY_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Thread interrupted while waiting to retry Qdrant fetch", ie);
            }
        }

        if (lastException != null) {
            throw new RuntimeException("Failed to fetch embeddings for topic " + topicId + " from Qdrant", lastException);
        }

        return positiveIds;
    }

    private List<PlagiarismResult> fetchRecommendations(Long topicId, List<String> positiveIds) {
        String recommendPath = buildRecommendPath();
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("positive", positiveIds);
        requestBody.put("limit", QDRANT_RECOMMEND_LIMIT);
        requestBody.put("with_payload", List.of("content", "metadata.topic_id", "metadata.chunk_index", "metadata.file_url"));
        requestBody.put("with_vectors", Boolean.FALSE);

        Map<String, Object> mustNotEntry = Map.of(
                "key", "metadata.topic_id",
                "match", Map.of("value", topicId)
        );
        Map<String, Object> filter = Map.of("must_not", List.of(mustNotEntry));
        requestBody.put("filter", filter);

        // Log JSON request body before sending to Qdrant
        try {
            String jsonRequest = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody);
            log.info("Sending request to Qdrant (recommend) - Topic ID: {}\nCollection: {}\nURL: {}\nRequest Body:\n{}", 
                    topicId, qdrantCollection, recommendPath, jsonRequest);
        } catch (Exception e) {
            log.warn("Failed to serialize request body to JSON: {}", e.getMessage());
        }

        JsonNode responseNode = null;
        try {
            responseNode = qdrantWebClient.post()
                            .uri(recommendPath)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(JsonNode.class)
                            .timeout(Duration.ofSeconds(10))
                            .block();
        } catch (WebClientResponseException ex) {
            // Log detailed error response from Qdrant
            try {
                String responseBody = ex.getResponseBodyAsString();
                log.error("Qdrant error response (recommend) - Topic ID: {}\nStatus: {}\nResponse Body: {}", 
                        topicId, ex.getStatusCode(), responseBody);
            } catch (Exception e) {
                log.error("Error fetching recommendations for topic {}: {} - Status: {}", 
                        topicId, ex.getMessage(), ex.getStatusCode());
            }
            throw ex;
        }

        List<PlagiarismResult> results = new ArrayList<>();

        if (responseNode == null) {
            log.warn("Received null response when fetching plagiarism recommendations for topic {}.", topicId);
            return results;
        }
        
        // Log response for debugging
        try {
            String jsonResponse = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(responseNode);
            log.debug("Qdrant response (recommend) - Topic ID: {}\n{}", topicId, jsonResponse);
        } catch (Exception e) {
            log.debug("Failed to serialize response to JSON: {}", e.getMessage());
        }

        JsonNode resultNode = responseNode.path("result");
        if (!resultNode.isArray()) {
            log.warn("Unexpected Qdrant recommendation response format for topic {}: {}", topicId, responseNode);
            return results;
        }

        resultNode.forEach(item -> {
            JsonNode payloadNode = item.path("payload");
            if (payloadNode.isMissingNode() || payloadNode.isNull()) {
                return;
            }

            JsonNode metadataNode = payloadNode.path("metadata");
            JsonNode plagiarizedTopicIdNode = metadataNode.path("topic_id");
            Long plagiarizedTopicId = plagiarizedTopicIdNode.isNumber() ? plagiarizedTopicIdNode.longValue() : null;

            if (plagiarizedTopicId == null) {
                log.debug("Skipping recommendation without metadata.topic_id for topic {}.", topicId);
                return;
            }

            String plagiarizedFileUrl = metadataNode.path("file_url").asText("");
            if (StringUtils.hasText(plagiarizedFileUrl)) {
                plagiarizedFileUrl = plagiarizedFileUrl.trim();
            }

            String plagiarizedContent = payloadNode.path("content").asText("");

            // Skip recommendations referencing the same topic (safety guard)
            if (plagiarizedTopicId.equals(topicId)) {
                return;
            }

            PlagiarismResult result = PlagiarismResult.builder()
                    .topicId(topicId)
                    .plagiarizedTopicId(plagiarizedTopicId)
                    .plagiarizedContent(plagiarizedContent)
                    .plagiarizedFileUrl(plagiarizedFileUrl)
                    .build();

            results.add(result);
        });

        log.info("Retrieved {} plagiarism recommendation(s) for topic {}.", results.size(), topicId);
        return results;
    }

    private String buildScrollPath() {
        return "/collections/" + qdrantCollection + "/points/scroll";
    }

    private String buildRecommendPath() {
        return "/collections/" + qdrantCollection + "/points/recommend";
    }

    /**
     * Get plagiarism results for a topic
     */
    @Override
    public List<PlagiarismResult> getPlagiarismResults(Long topicId) {
        if (topicId == null) {
            log.error("TopicId is null");
            throw new IllegalArgumentException("TopicId is required");
        }

        log.info("Fetching plagiarism results for topic ID: {}", topicId);
        List<PlagiarismResult> results = plagiarismResultRepository.findByTopicId(topicId);
        log.info("Found {} plagiarism result(s) for topic ID: {}", results.size(), topicId);
        return results;
    }

    /**
     * Delete topic from Qdrant via N8N webhook
     */
    @Override
    public Mono<Boolean> deleteTopicFromQdrant(Long topicId) {
        // Validate input
        if (topicId == null) {
            log.error("TopicId is null");
            return Mono.error(new IllegalArgumentException("TopicId is required"));
        }

        log.info("Starting delete topic from Qdrant - Topic ID: {}", topicId);

        // Call N8N webhook to delete topic from Qdrant
        return callN8nDeleteWebhook(topicId)
                .doOnSuccess(result -> log.info("Successfully deleted topic {} from Qdrant", topicId))
                .doOnError(e -> log.error("Error deleting topic {} from Qdrant: {}", topicId, e.getMessage(), e))
                .onErrorMap(e -> {
                    String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
                    return new RuntimeException("Error deleting topic from Qdrant: " + errorMsg, e);
                });
    }

    /**
     * Call N8N webhook to delete topic from Qdrant
     */
    private Mono<Boolean> callN8nDeleteWebhook(Long topicId) {
        log.debug("Calling N8N delete webhook - Topic: {}", topicId);
        
        return n8nWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(deletePath)
                        .queryParam("topicId", topicId)
                        .build())
//                .header("X-INGEST-TOKEN", ingestToken)
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(30))
                .thenReturn(true)
                .doOnSuccess(v -> log.info("N8N delete webhook called successfully for topic: {}", topicId))
                .onErrorResume(e -> {
                    log.error("Failed to call N8N delete webhook for topic {}: {}", topicId, e.getMessage(), e);
                    return Mono.error(new RuntimeException("N8N delete webhook failed: " + e.getMessage(), e));
                });
    }
}

