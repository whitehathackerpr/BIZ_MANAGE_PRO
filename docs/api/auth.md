# Authentication API Documentation

## Overview
The Authentication API provides endpoints for user authentication, registration, and token management.

## Base URL
```
http://localhost:5000/api/v1/auth
```

## Endpoints

### Login
Authenticate a user and return a JWT token.

```http
POST /login
```

#### Request Body
```json
{
    "email": "user@example.com",
    "password": "your_password"
}
```

#### Response
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "role": "admin",
        "branch_id": 1
    }
}
```

### Register
Register a new user.

```http
POST /register
```

#### Request Body
```json
{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "employee",
    "branch_id": 1
}
```

#### Response
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 2,
        "email": "newuser@example.com",
        "username": "newuser",
        "role": "employee",
        "branch_id": 1
    }
}
```

### Refresh Token
Get a new access token using a refresh token.

```http
POST /refresh
```

#### Request Body
```json
{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Response
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
Invalidate the current access token.

```http
POST /logout
```

#### Headers
```
Authorization: Bearer <access_token>
```

#### Response
```json
{
    "message": "Successfully logged out"
}
```

### Forgot Password
Request a password reset email.

```http
POST /forgot-password
```

#### Request Body
```json
{
    "email": "user@example.com"
}
```

#### Response
```json
{
    "message": "Password reset email sent"
}
```

### Reset Password
Reset password using the token from the email.

```http
POST /reset-password
```

#### Request Body
```json
{
    "token": "reset_token_from_email",
    "new_password": "new_password123"
}
```

#### Response
```json
{
    "message": "Password reset successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Invalid input",
    "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
    "error": "Forbidden",
    "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
    "error": "Not Found",
    "message": "User not found"
}
```

### 429 Too Many Requests
```json
{
    "error": "Too Many Requests",
    "message": "Rate limit exceeded"
}
```

## Rate Limiting
- Login attempts: 5 per minute
- Password reset requests: 3 per hour
- Registration attempts: 3 per hour

## Security
- All endpoints use HTTPS
- Passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Rate limiting is applied to prevent brute force attacks 