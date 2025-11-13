package mss.project.checkplagiarismservice.services;

import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

/**
 * Interface for S3 file storage operations
 */
public interface S3Service {
    
    /**
     * Upload file to S3 without returning URL
     * 
     * @param file the file to upload
     * @param prefix the prefix/folder path in S3
     * @return Mono<Void> indicating completion
     */
    Mono<Void> uploadFile(FilePart file, String prefix);
    
    /**
     * Download file from S3 by key
     * 
     * @param key the S3 key (path) of the file
     * @return byte array containing file content
     */
    byte[] downloadFile(String key);
    
    /**
     * Upload file to S3 and return its URL
     * 
     * @param file the file to upload
     * @param prefix the prefix/folder path in S3
     * @return Mono<String> containing the URL of the uploaded file
     */
    Mono<String> uploadFileAndGetUrl(FilePart file, String prefix);
}
