# Industry Standard HTTP Error Codes and Use Cases

This note explains the most common HTTP status codes used in backend APIs and when to use them.

---

## 1xx - Informational

### 100 Continue

- Used when the server has received the request headers and the client should continue sending the body.
- Rare in normal app APIs.

### 101 Switching Protocols

- Used for protocol upgrades like WebSocket handshakes.
- Not commonly used in REST APIs.

---

## 2xx - Success

### 200 OK

- General success response.
- Typical for GET, successful update, or successful general request.

### 201 Created

- Resource successfully created.
- Typical for signup, create project, create post, etc.

### 202 Accepted

- Request accepted for processing but not completed yet.
- Common for async jobs or background tasks.

### 204 No Content

- Successful request with no response body.
- Common for delete operations.

---

## 3xx - Redirection

### 301 Moved Permanently

- Resource has a new permanent URL.
- Mostly for web routing and SEO.

### 302 Found

- Temporary redirect.
- Used less often in APIs.

### 304 Not Modified

- Used for caching.
- Tells the client the resource has not changed.

---

## 4xx - Client Errors

### 400 Bad Request

- Request syntax is invalid or malformed.
- Use when body data is wrong, missing required fields, or the request cannot be processed.

Example:

- invalid JSON
- missing password field
- malformed email format

### 401 Unauthorized

- User is not authenticated.
- The client is not logged in or lacks valid credentials.

Example:

- token missing
- token invalid
- user not logged in

### 403 Forbidden

- User is authenticated but does not have permission.
- The user is logged in, but not allowed to access the resource.

Example:

- regular user trying to access admin route
- trying to delete another user’s data

### 404 Not Found

- Resource does not exist.
- Use when the route or resource is missing.

Example:

- user ID not found
- project not found
- page not found

### 405 Method Not Allowed

- HTTP method is not allowed for that route.
- Example: using POST on a route that only accepts GET.

### 409 Conflict

- Request conflicts with the current state of the resource.
- Usually used for duplicate data or conflicting state.

Example:

- email already exists
- username already taken
- trying to create a duplicate record

### 422 Unprocessable Entity

- Request is syntactically valid, but semantically invalid.
- Common in validation-heavy APIs.

Example:

- invalid password strength
- wrong data shape but valid JSON
- business-rule validation failure

### 429 Too Many Requests

- Client has sent too many requests in a short time.
- Common for rate limiting.

Example:

- API throttling
- login retry limit
- spam protection

---

## 5xx - Server Errors

### 500 Internal Server Error

- Generic server-side failure.
- Use when something unexpected goes wrong.

Example:

- unhandled exception
- database issue not specifically classified

### 501 Not Implemented

- The server does not support the requested method or feature.

Example:

- a route exists but the functionality is not built yet

### 502 Bad Gateway

- Server received an invalid response from an upstream server.
- Often used in proxy or integration scenarios.

### 503 Service Unavailable

- Server is temporarily unavailable.
- Common for maintenance or overload.

### 504 Gateway Timeout

- Upstream server timed out.
- Common in third-party API calls or microservice communication.

---

## Common API mapping in real projects

### Authentication

- 400: invalid login payload
- 401: token missing or invalid
- 403: authenticated user has no permission
- 409: user already exists

### User profile

- 200: profile fetched successfully
- 201: profile created
- 400: invalid input
- 404: user not found
- 409: duplicate email/username

### Project management app

- 201: project created
- 404: project not found
- 403: user is not a member or owner
- 409: duplicate project name or conflicting assignment
- 422: invalid project data according to business rules

### Password reset / email verification

- 400: invalid or expired token
- 404: user not found
- 409: email already verified or already reset request exists

### Payment / third-party integrations

- 502: bad response from payment provider
- 503: provider unavailable
- 504: provider timeout
- 429: rate limited

---

## Good practice for backend projects

Use the most accurate code for the real problem:

- 400 for malformed input
- 401 for missing/invalid authentication
- 403 for permission issues
- 404 for missing resource
- 409 for conflicts
- 422 for business-rule validation failures
- 429 for abuse/rate limiting
- 500 for unexpected server issues

Avoid using 500 too often for expected user errors.
A 400, 401, 403, 404, or 409 is usually more accurate than a generic 500.

---

## Summary

HTTP status codes help clients understand what happened without reading message text alone.

Use them consistently across your API so frontend developers and testers know what to expect.

---

## Example API response

```json
{
   "success": false,
   "statusCode": 401,
   "message": "Unauthorized: valid token is required"
}
```

This is a clear and standard format for the frontend to handle.
