package mss.project.checkplagiarismservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.ResponseBytes;

import java.nio.ByteBuffer;
import java.util.Objects;

@Service
public class S3ServiceImpl implements S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Value("${n8n.ingest-path}")
    private String ingestPath;

    @Value("${n8n.token}")
    private String ingestToken;

    @Override
    public Mono<Void> uploadFile(FilePart file, String prefix) {
        return DataBufferUtils.join(file.content())
                .map(dataBuffer -> {
                    ByteBuffer byteBuffer = dataBuffer.asByteBuffer();
                    byte[] bytes = new byte[byteBuffer.remaining()];
                    byteBuffer.get(bytes);
                    return bytes;
                })
                .flatMap(bytes -> {
                    // Wrap blocking S3Client calls in Mono.fromCallable and run on blocking scheduler
                    return Mono.fromCallable(() -> {
                        s3Client.putObject(PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(prefix + file.filename())
                                .build(), RequestBody.fromBytes(bytes));
                        return null;
                    })
                    .subscribeOn(Schedulers.boundedElastic()) // Run blocking S3 operations on separate thread pool
                    .then();
                });
    }

    @Override
    public byte[] downloadFile(String key) {
        ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(GetObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build());
        return responseBytes.asByteArray();
    }

    @Override
    public Mono<String> uploadFileAndGetUrl(FilePart file, String prefix) {
        String safePrefix = (prefix == null || prefix.isBlank()) ? "" :
                (prefix.endsWith("/") ? prefix : prefix + "/");

        String fileName = Objects.requireNonNullElse(file.filename(), "file.bin");
        String key = safePrefix + fileName;

        return DataBufferUtils.join(file.content())
                .map(dataBuffer -> {
                    ByteBuffer byteBuffer = dataBuffer.asByteBuffer();
                    byte[] bytes = new byte[byteBuffer.remaining()];
                    byteBuffer.get(bytes);
                    return bytes;
                })
                .flatMap(bytes -> {
                    // Wrap blocking S3Client calls in Mono.fromCallable and run on blocking scheduler
                    return Mono.fromCallable(() -> {
                        s3Client.putObject(
                                PutObjectRequest.builder()
                                        .bucket(bucketName)
                                        .key(key)
                                        .contentType(file.headers().getContentType() != null ? 
                                                file.headers().getContentType().toString() : null)
                                        .build(),
                                RequestBody.fromBytes(bytes)
                        );
                        return s3Client.utilities().getUrl(b -> b.bucket(bucketName).key(key)).toString();
                    })
                    .subscribeOn(Schedulers.boundedElastic()); // Run blocking S3 operations on separate thread pool
                });
    }
}

