package mss.project.topicapprovalservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Upload file to S3
     * @param file MultipartFile to upload
     * @return S3 URL of uploaded file
     */
    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            String fileName = generateFileName(file.getOriginalFilename());
            String contentType = file.getContentType();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest, 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded successfully to S3: {}", fileName);

            // Return the S3 URL
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, fileName);

        } catch (IOException e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    /**
     * Delete file from S3
     * @param fileName Name of file to delete
     */
    public void deleteFile(String fileName) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully from S3: {}", fileName);

        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    /**
     * Get presigned URL for file (valid for 1 hour)
     * @param fileName Name of file
     * @return Presigned URL
     */
    public String getFileUrl(String fileName) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            software.amazon.awssdk.services.s3.presigner.S3Presigner presigner = 
                software.amazon.awssdk.services.s3.presigner.S3Presigner.create();

            software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest presignRequest = 
                software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(1))
                    .getObjectRequest(getObjectRequest)
                    .build();

            URL url = presigner.presignGetObject(presignRequest).url();
            presigner.close();

            return url.toString();

        } catch (S3Exception e) {
            log.error("Error getting file URL from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to get file URL from S3", e);
        }
    }

    /**
     * List all files in bucket
     * @return List of file names
     */
    public List<String> listFiles() {
        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .build();

            ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

            List<String> fileNames = new ArrayList<>();
            for (S3Object s3Object : listResponse.contents()) {
                fileNames.add(s3Object.key());
            }

            log.info("Listed {} files from S3 bucket", fileNames.size());
            return fileNames;

        } catch (S3Exception e) {
            log.error("Error listing files from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to list files from S3", e);
        }
    }

    /**
     * Check if file exists in S3
     * @param fileName Name of file
     * @return true if exists, false otherwise
     */
    public boolean fileExists(String fileName) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.error("Error checking file existence in S3: {}", e.getMessage());
            throw new RuntimeException("Failed to check file existence in S3", e);
        }
    }

    /**
     * Extract file name from S3 URL
     * @param s3Url S3 URL (e.g., https://bucket.s3.amazonaws.com/path/fileName)
     * @return File name (key) or null if cannot extract
     */
    public String extractFileNameFromUrl(String s3Url) {
        if (s3Url == null || s3Url.isEmpty()) {
            return null;
        }
        
        try {
            // Try to parse as URL
            java.net.URL url = new java.net.URL(s3Url);
            String path = url.getPath();
            
            // Remove leading slash and get the file name
            if (path != null && path.length() > 1) {
                // Remove leading slash
                String key = path.substring(1);
                // If the URL contains bucket name in path, remove it
                if (key.startsWith(bucketName + "/")) {
                    key = key.substring(bucketName.length() + 1);
                }
                return key;
            }
            
            // Fallback: try to extract from path pattern
            // Format: https://bucket.s3.amazonaws.com/fileName
            String[] parts = s3Url.split("/");
            if (parts.length > 0) {
                return parts[parts.length - 1];
            }
            
            return null;
        } catch (Exception e) {
            log.warn("Failed to extract file name from URL: {}, error: {}", s3Url, e.getMessage());
            // Fallback: try simple extraction
            try {
                String[] parts = s3Url.split("/");
                if (parts.length > 0) {
                    return parts[parts.length - 1];
                }
            } catch (Exception ex) {
                log.error("Error in fallback file name extraction: {}", ex.getMessage());
            }
            return null;
        }
    }

    /**
     * Generate unique file name with timestamp
     * @param originalFilename Original file name
     * @return Unique file name
     */
    private String generateFileName(String originalFilename) {
        long timestamp = System.currentTimeMillis();
        return timestamp + "_" + originalFilename;
    }
}
