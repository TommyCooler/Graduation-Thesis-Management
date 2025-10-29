package mss.project.checkplagiarismservice.dtos.request;

public record IngestRequest(String url, String filename, String docId, String source, String mime, long size) {
}
