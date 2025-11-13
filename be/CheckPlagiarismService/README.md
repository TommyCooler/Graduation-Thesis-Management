# Check Plagiarism Service - Gateway Endpoints

Gateway base URL: `http://localhost:8080`

Service route prefix: `/plagiarism-service`

## Database Setup

### Using Docker Compose

1. Start PostgreSQL database:
   ```bash
   cd CheckPlagiarismService
   docker-compose up -d
   ```

2. Database connection details:
   - **Host**: `localhost`
   - **Port**: `5433` (mapped from container port 5432)
   - **Database**: `plagiarismdb`
   - **Username**: `postgres`
   - **Password**: `postgres123`

3. Update `.env` file:
   ```env
   PLAGIARISM_DB_URL=jdbc:postgresql://localhost:5433/plagiarismdb
   PLAGIARISM_DB_USERNAME=postgres
   PLAGIARISM_DB_PASSWORD=postgres123
   ```

4. Stop database:
   ```bash
   docker-compose down
   ```

5. Stop and remove database with data:
   ```bash
   docker-compose down -v
   ```

## Endpoints

- Health
  - GET `/plagiarism-service/api/plagiarism/health`
- Send file to check plagiarism
  - POST `/plagiarism-service/api/plagiarism/send`
  - Consumes: `multipart/form-data`
  - Params: `file` (form-data), `topicId` (query)
- Receive report (webhook from n8n)
  - POST `/plagiarism-service/api/plagiarism/report`



- run server in terminal: cloudflared tunnel run n8n-project
