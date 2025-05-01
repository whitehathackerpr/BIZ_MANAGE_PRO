# BIZ_MANAGE_PRO API Documentation

## Core APIs

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

### Business Management
- `POST /api/v1/businesses/` - Create new business
- `GET /api/v1/businesses/` - List businesses
- `GET /api/v1/businesses/{id}` - Get business details
- `PUT /api/v1/businesses/{id}` - Update business
- `DELETE /api/v1/businesses/{id}` - Delete business

### Branch Management
- `POST /api/v1/businesses/{id}/branches/` - Create branch
- `GET /api/v1/businesses/{id}/branches/` - List branches
- `GET /api/v1/businesses/{id}/branches/{branch_id}` - Get branch details
- `PUT /api/v1/businesses/{id}/branches/{branch_id}` - Update branch
- `DELETE /api/v1/businesses/{id}/branches/{branch_id}` - Delete branch

### Customer Management
- `POST /api/v1/customers/` - Create customer
- `GET /api/v1/customers/` - List customers
- `GET /api/v1/customers/{id}` - Get customer details
- `PUT /api/v1/customers/{id}` - Update customer
- `DELETE /api/v1/customers/{id}` - Delete customer
- `GET /api/v1/customers/{id}/orders` - Get customer orders
- `GET /api/v1/customers/{id}/transactions` - Get customer transactions

### Supplier Management
- `POST /api/v1/suppliers/` - Create supplier
- `GET /api/v1/suppliers/` - List suppliers
- `GET /api/v1/suppliers/{id}` - Get supplier details
- `PUT /api/v1/suppliers/{id}` - Update supplier
- `DELETE /api/v1/suppliers/{id}` - Delete supplier
- `GET /api/v1/suppliers/{id}/products` - Get supplier products
- `POST /api/v1/suppliers/{id}/products` - Add supplier product

## Feature APIs

### Notification System
- `GET /api/v1/notifications/` - List notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `POST /api/v1/notifications/` - Create notification
- `PUT /api/v1/notifications/{id}` - Update notification
- `DELETE /api/v1/notifications/{id}` - Delete notification
- `POST /api/v1/notifications/{id}/read` - Mark as read
- `POST /api/v1/notifications/read-all` - Mark all as read
- `GET /api/v1/notifications/preferences` - Get preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

### Performance Management
- `POST /api/v1/performance/metrics/` - Create performance metric
- `GET /api/v1/performance/metrics/` - List performance metrics
- `POST /api/v1/performance/reviews/` - Create performance review
- `GET /api/v1/performance/reviews/` - List performance reviews
- `GET /api/v1/performance/reviews/{id}` - Get review details
- `GET /api/v1/performance/summary/{employee_id}` - Get performance summary
- `GET /api/v1/performance/dashboard/{employee_id}` - Get performance dashboard

### User Management
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user
- `GET /api/v1/users/{id}/permissions` - Get user permissions

### Profile Management
- `GET /api/v1/profile/` - Get own profile
- `PUT /api/v1/profile/` - Update profile
- `PUT /api/v1/profile/password` - Change password
- `GET /api/v1/profile/activities` - Get activity history

## Response Formats

All API responses follow the standard format:

```json
{
    "status": "success|error",
    "data": {
        // Response data
    },
    "message": "Optional message",
    "errors": [] // Array of errors if any
}
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication using JWT Bearer token:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

API requests are rate-limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Permissions

Access to endpoints is controlled by role-based permissions. Common roles include:
- OWNER
- ADMIN
- MANAGER
- EMPLOYEE
- CUSTOMER
- SUPPLIER

Each role has specific permissions that determine access to different endpoints.