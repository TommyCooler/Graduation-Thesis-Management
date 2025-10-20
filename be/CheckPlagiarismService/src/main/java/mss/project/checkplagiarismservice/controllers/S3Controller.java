package mss.project.checkplagiarismservice.controllers;

import mss.project.checkplagiarismservice.dtos.response.ApiResponse;
import mss.project.checkplagiarismservice.services.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RequestMapping("/v1/s3")
@RestController
public class S3Controller {

    @Autowired
    private S3Service s3Service;

    @Value("${folder.prefix}")
    private String prefix = "topic";

//    @PostMapping("/upload")
//    public ResponseEntity<ApiResponse<?>> upload(@RequestParam("file") MultipartFile file) throws IOException {
//
//        s3Service.uploadFile(file, prefix);
//        return ResponseEntity.ok(ApiResponse.builder()
//                .status("200")
//                .message("File uploaded successfully")
//                .data("")
//                .build());
//    }


    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<?>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String url = s3Service.uploadFileAndGetUrl(file, "topic");
        return ResponseEntity.ok(ApiResponse.builder()
                .status("200")
                .message("File uploaded successfully")
                .data(Map.of("url", url))
                .build());
    }


    public ResponseEntity<?> download(@PathVariable String filename) {
        byte[] bytes = s3Service.downloadFile(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .body(bytes);
    }

}
