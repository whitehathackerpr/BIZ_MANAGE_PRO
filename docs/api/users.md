# User Management API Documentation

## Overview
The User Management API provides endpoints for managing user accounts, roles, and permissions.

## Base URL
```
http://localhost:5000/api/v1/users
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Get All Users
Retrieve a list of all users with pagination and filtering.

```http
GET /
```

#### Query Parameters
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `role`: Filter by role
- `branch_id`: Filter by branch
- `status`: Filter by status
- `search`: Search by name or email

#### Response
```json
{
    "users": [
        {
            "id": 1,
            "email": "user@example.com",
            "username": "username",
            "first_name": "John",
            "last_name": "Doe",
            "role": "admin",
            "branch_id": 1,
            "status": "active",
            "created_at": "2024-03-30T12:00:00Z"
        }
    ],
    "total": 100,
    "pages": 10,
    "current_page": 1
}
```

### Get User
Retrieve details of a specific user.

```http
GET /{user_id}
```

#### Response
```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "branch_id": 1,
    "status": "active",
    "created_at": "2024-03-30T12:00:00Z",
    "last_login": "2024-03-30T12:00:00Z"
}
```

### Create User
Create a new user account.

```http
POST /
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
    "message": "User created successfully",
    "user": {
        "id": 2,
        "email": "newuser@example.com",
        "username": "newuser",
        "first_name": "John",
        "last_name": "Doe",
        "role": "employee",
        "branch_id": 1,
        "status": "active"
    }
}
```

### Update User
Update an existing user's information.

```http
PUT /{user_id}
```

#### Request Body
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "role": "manager",
    "branch_id": 2,
    "status": "active"
}
```

#### Response
```json
{
    "message": "User updated successfully",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "first_name": "John",
        "last_name": "Doe",
        "role": "manager",
        "branch_id": 2,
        "status": "active"
    }
}
```

### Delete User
Delete a user account.

```http
DELETE /{user_id}
```

#### Response
```json
{
    "message": "User deleted successfully"
}
```

### Change Password
Change a user's password.

```http
POST /{user_id}/change-password
```

#### Request Body
```json
{
    "current_password": "old_password",
    "new_password": "new_password"
}
```

#### Response
```json
{
    "message": "Password changed successfully"
}
```

### Update Profile
Update the current user's profile information.

```http
PUT /profile
```

#### Request Body
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890"
}
```

#### Response
```json
{
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "username",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890"
    }
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
    "message": "Invalid or expired token"
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

### 409 Conflict
```json
{
    "error": "Conflict",
    "message": "Email already exists"
}
```

## Rate Limiting
- GET requests: 100 per minute
- POST/PUT/DELETE requests: 20 per minute

## Security
- All endpoints require authentication
- Password changes require current password verification
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting to prevent abuse 