# Plagiarism Service - Gateway Endpoints

Gateway base URL: `http://localhost:8080`

Service route prefix: `/plagiarism-service`

## Endpoints

- Health
  - GET `/plagiarism-service/api/plagiarism/health`
- Send file to check plagiarism
  - POST `/plagiarism-service/api/plagiarism/send`
  - Consumes: `multipart/form-data`
  - Params: `file` (form-data), `topicId` (query)
- Receive report (webhook from n8n)
  - POST `/plagiarism-service/api/plagiarism/report`
