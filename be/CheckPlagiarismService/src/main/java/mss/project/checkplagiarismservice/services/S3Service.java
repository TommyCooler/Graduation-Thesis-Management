package mss.project.checkplagiarismservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucket.name}")
    private String bucketName;

    public void uploadFile(MultipartFile file, String prefix) throws IOException {

        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(prefix + file.getOriginalFilename())
                .build(), RequestBody.fromBytes(file.getBytes()));


    }

    public byte[] downloadFile(String key) {
        ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(GetObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build());
        return responseBytes.asByteArray();
    }

    public String uploadFileAndGetUrl(MultipartFile file, String prefix) throws IOException {
        // đảm bảo có dấu "/"
        String safePrefix = (prefix == null || prefix.isBlank()) ? "" :
                (prefix.endsWith("/") ? prefix : prefix + "/");

        String fileName = Objects.requireNonNullElse(file.getOriginalFilename(), "file.bin");
        String key = safePrefix + fileName; // ví dụ: "topic/356924.356930.pdf"

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        // Lấy URL cố định (sẽ truy cập được nếu object public)
        URL url = s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(key));
        return url.toString(); // ví dụ: https://mss-file.s3.ap-southeast-2.amazonaws.com/topic/356924.356930.pdf
    }

}
