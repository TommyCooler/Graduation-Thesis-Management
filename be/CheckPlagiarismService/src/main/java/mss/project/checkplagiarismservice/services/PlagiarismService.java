package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.dtos.request.PlagiarismReportRequest;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Interface for plagiarism checking service operations
 */
public interface PlagiarismService {
    
    /**
     * Send file data to N8N for plagiarism checking
     * 
     * @param file the file to check for plagiarism
     * @param topicId the topic ID associated with the file
     * @return Mono<Boolean> indicating success or failure
     */
    Mono<Boolean> sendDataToN8n(FilePart file, Long topicId);
    
    /**
     * Process plagiarism report received from N8N
     * 
     * @param reportRequest the plagiarism report request containing results
     */
    void processPlagiarismReport(PlagiarismReportRequest reportRequest, Long topicId);
    
    /**
     * Delete topic from Qdrant via N8N
     * 
     * @param topicId the topic ID to delete from Qdrant
     * @return Mono<Boolean> indicating success or failure
     */
    Mono<Boolean> deleteTopicFromQdrant(Long topicId);
    
    /**
     * Get plagiarism results for a topic
     * 
     * @param topicId the topic ID to get results for
     * @return List of plagiarism results
     */
    List<mss.project.checkplagiarismservice.pojos.PlagiarismResult> getPlagiarismResults(Long topicId);

}
