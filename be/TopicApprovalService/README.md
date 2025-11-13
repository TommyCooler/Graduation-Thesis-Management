# Topic Approval Service - Gateway Endpoints

Gateway base URL: `http://localhost:8080`

Service route prefix: `/topic-approval-service`

## Topic Approval (service health/info)
- GET `/topic-approval-service/api/topic-approval/health`
- GET `/topic-approval-service/api/topic-approval/info`

## Topics
- POST `/topic-approval-service/api/topics/create`
- PUT  `/topic-approval-service/api/topics/update/{id}`
- DELETE `/topic-approval-service/api/topics/delete/{id}`
- GET  `/topic-approval-service/api/topics/{id}`
- GET  `/topic-approval-service/api/topics/all`
- GET  `/topic-approval-service/api/topics/topic-count`
- PUT  `/topic-approval-service/api/topics/approve/{id}`
- PUT  `/topic-approval-service/api/topics/reject/{id}`
- GET  `/topic-approval-service/api/topics/approved`
- GET  `/topic-approval-service/api/topics/by-status`
- GET  `/topic-approval-service/api/topics/my-topics`
- POST `/topic-approval-service/api/topics/{topicId}/join`
- GET  `/topic-approval-service/api/topics/{topicId}/members`
- POST `/topic-approval-service/api/topics/approve-v2/{id}`
- GET  `/topic-approval-service/api/topics/pending-for-approval`
- GET  `/topic-approval-service/api/topics/my-approved`
- GET  `/topic-approval-service/api/topics/fully-approved`
- GET  `/topic-approval-service/api/topics/{topicId}/can-edit`

## Topic History
- GET `/topic-approval-service/api/topic-history/topic/{topicId}`
- GET `/topic-approval-service/api/topic-history/user/{username}`

## Councils
- POST `/topic-approval-service/api/councils/create`
- GET  `/topic-approval-service/api/councils/all`
- PUT  `/topic-approval-service/api/councils/{councilId}/status`

## Progress Review Councils
- POST `/topic-approval-service/api/progress-review-councils/{topicID}`
- GET  `/topic-approval-service/api/progress-review-councils/{topicID}`
- GET  `/topic-approval-service/api/progress-review-councils/lecturers`
- PUT  `/topic-approval-service/api/progress-review-councils/{councilID}/status`

## Review Council Members
- GET  `/topic-approval-service/api/review-council-members/{councilId}`
- PUT  `/topic-approval-service/api/review-council-members/{councilID}/comment`

## S3 (topic files)
- POST   `/topic-approval-service/api/s3/upload`
- DELETE `/topic-approval-service/api/s3/delete/{fileName}`
- GET    `/topic-approval-service/api/s3/url/{fileName}`
- GET    `/topic-approval-service/api/s3/files`
- GET    `/topic-approval-service/api/s3/exists/{fileName}`
