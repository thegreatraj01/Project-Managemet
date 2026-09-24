# Project Camp Backend

A backend API for a collaborative project management system built with Node.js, Express, MongoDB, and Mongoose.

This project follows the goals defined in the PRD and currently focuses on building a secure authentication and user-management foundation before expanding into project, task, and team features.

---

## Project Goal

The main goal of this project is to build a REST API that supports:

- user registration and authentication
- project creation and management
- team member management
- task and subtask tracking
- notes and project collaboration
- role-based access control
- email-based verification and password recovery

The full product vision is described in [PRD.md](PRD.md).

---

## Current Status

### Completed so far

#### Authentication and user flow

- User registration
- User login
- User logout
- Get current logged-in user
- JWT access token generation
- Refresh token generation and refresh flow
- Password change
- Forgot password request
- Reset password flow
- Email verification flow
- Resend verification email

#### Security

- JWT verification middleware
- Cookie-based token storage
- Authorization header support for access token
- Input validation using express-validator
- Standardized API error handling
- HTTP status codes aligned to backend conventions

#### Email system

- Email sending with Brevo
- Verification email templates
- Password reset email templates

#### Infrastructure

- Express app setup
- CORS configuration
- Cookie parser middleware
- Health check endpoint
- MongoDB connection setup

---

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcrypt for password hashing
- dotenv for environment variables
- Brevo for transactional email
- express-validator for request validation

---

## Project Structure

```bash
src/
  app.js
  index.js
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validators/
```

---

## Current API Modules

### Auth routes

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/current-user
- POST /api/v1/auth/change-password
- POST /api/v1/auth/refresh-token
- GET /api/v1/auth/verify-email/:verificationToken
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password/:resetToken
- POST /api/v1/auth/resend-verification-email

### Health check

- GET /api/v1/healthcheck

---

## Important Notes

The authentication foundation is largely in place and working as a base for the rest of the application. The next major phases should be:

1. Project CRUD APIs
2. Role-based project membership logic
3. Task and subtask management
4. Project notes feature
5. Role and permission enforcement for all project modules
6. File upload support for task attachments

---

## Roadmap

### Phase 1: User & auth foundation

- Completed

### Phase 2: Project management

- Planned

### Phase 3: Team and role management

- Planned

### Phase 4: Task + subtask management

- Planned

### Phase 5: Notes and collaboration

- Planned

---

## Notes

This project is still under active development, but the base backend architecture and core authentication flow are already established according to the PRD requirements.

For the full product requirements and expected feature scope, refer to [PRD.md](PRD.md).
