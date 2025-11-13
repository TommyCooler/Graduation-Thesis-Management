# Account Service - Gateway Endpoints

Gateway base URL: `http://localhost:8080`

Service route prefix: `/account-service`

## Auth
- POST `/account-service/api/auth/login`
- POST `/account-service/api/auth/register`
- GET  `/account-service/api/auth/verify`
- POST `/account-service/api/auth/otp/send`
- POST `/account-service/api/auth/otp/resend`
- POST `/account-service/api/auth/otp/verify`
- POST `/account-service/api/auth/otp/clear-quota`
- POST `/account-service/api/auth/password/forgot`
- POST `/account-service/api/auth/password/reset`
- POST `/account-service/api/auth/logout`
- GET  `/account-service/api/auth/me`
- POST `/account-service/api/auth/provide-email`
- POST `/account-service/api/auth/password/change-first-login`

## Accounts
- GET  `/account-service/api/accounts/all`
- GET  `/account-service/api/accounts/email/{email}`
- GET  `/account-service/api/accounts/{id}`
- GET  `/account-service/api/accounts/{id}/details`
- GET  `/account-service/api/accounts/all-paged`
- GET  `/account-service/api/accounts/current-account`
- PUT  `/account-service/api/accounts/{id}`
