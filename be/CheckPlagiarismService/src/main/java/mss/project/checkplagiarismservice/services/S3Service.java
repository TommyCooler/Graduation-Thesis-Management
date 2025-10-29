package mss.project.checkplagiarismservice.services;

import mss.project.checkplagiarismservice.dtos.request.IngestRequest;
import mss.project.checkplagiarismservice.dtos.request.PayloadRequest;
import mss.project.checkplagiarismservice.dtos.response.N8nResponse;
import mss.project.checkplagiarismservice.pojos.PlagiarismReport;
import mss.project.checkplagiarismservice.repositories.PlagiarismRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

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

    @Autowired
    private PlagiarismRepository  plagiarismRepository;

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

    public N8nResponse uploadFileAndGetUrl(MultipartFile file, String prefix, Long topicId) throws IOException {

        String safePrefix = (prefix == null || prefix.isBlank()) ? "" :
                (prefix.endsWith("/") ? prefix : prefix + "/");

        String fileName = Objects.requireNonNullElse(file.getOriginalFilename(), "file.bin");
        String key = safePrefix + fileName;

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );

        String url = s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(key)).toString();

        PlagiarismReport plagiarismReport = new PlagiarismReport(topicId);

        // 3) Gửi sang n8n để ingest
//        IngestRequest payload = new IngestRequest(
//                url,
//                file.getOriginalFilename(),
//                docId,
//                "upload-api",
//                file.getContentType(),
//                file.getSize()
//        );

        PayloadRequest payload = new PayloadRequest(plagiarismReport.getId(), "");

        Map<?,?> n8nResp = n8nWebClient.post()
                .uri(ingestPath)
                .header("X-INGEST-TOKEN", ingestToken) // n8n IF node kiểm tra header này
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r -> r.createException().flatMap(Mono::error))
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(30));

        return new N8nResponse(url, n8nResp);
    }

}
