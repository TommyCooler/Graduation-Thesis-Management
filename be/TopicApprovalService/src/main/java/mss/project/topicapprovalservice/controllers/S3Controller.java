package mss.project.topicapprovalservice.controllers;

import lombok.RequiredArgsConstructor;
import mss.project.topicapprovalservice.dtos.responses.ApiResponse;
import mss.project.topicapprovalservice.services.S3Service;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    /**
     * Upload file to S3
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadFile(@RequestPart("file") MultipartFile file) {
        try {
            String fileUrl = s3Service.uploadFile(file);
            
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(200);
            response.setMessage("File uploaded successfully");
            response.setData(fileUrl);
            return response;
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("Failed to upload file: " + e.getMessage());
            return response;
        }
    }

    /**
     * Delete file from S3
     */
    @DeleteMapping("/delete/{fileName}")
    public ApiResponse<Void> deleteFile(@PathVariable String fileName) {
        try {
            s3Service.deleteFile(fileName);
            
            ApiResponse<Void> response = new ApiResponse<>();
            response.setCode(200);
            response.setMessage("File deleted successfully");
            return response;
        } catch (Exception e) {
            ApiResponse<Void> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("Failed to delete file: " + e.getMessage());
            return response;
        }
    }

    /**
     * Get presigned URL for file
     */
    @GetMapping("/url/{fileName}")
    public ApiResponse<String> getFileUrl(@PathVariable String fileName) {
        try {
            String fileUrl = s3Service.getFileUrl(fileName);
            
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(200);
            response.setMessage("File URL retrieved successfully");
            response.setData(fileUrl);
            return response;
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("Failed to get file URL: " + e.getMessage());
            return response;
        }
    }

    /**
     * List all files in bucket
     */
    @GetMapping("/files")
    public ApiResponse<List<String>> listFiles() {
        try {
            List<String> files = s3Service.listFiles();
            
            ApiResponse<List<String>> response = new ApiResponse<>();
            response.setCode(200);
            response.setMessage("Files listed successfully");
            response.setData(files);
            return response;
        } catch (Exception e) {
            ApiResponse<List<String>> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("Failed to list files: " + e.getMessage());
            return response;
        }
    }

    /**
     * Check if file exists
     */
    @GetMapping("/exists/{fileName}")
    public ApiResponse<Boolean> fileExists(@PathVariable String fileName) {
        try {
            boolean exists = s3Service.fileExists(fileName);
            
            ApiResponse<Boolean> response = new ApiResponse<>();
            response.setCode(200);
            response.setMessage(exists ? "File exists" : "File does not exist");
            response.setData(exists);
            return response;
        } catch (Exception e) {
            ApiResponse<Boolean> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("Failed to check file existence: " + e.getMessage());
            return response;
        }
    }
}
