# Branch Management API Documentation

## Overview
The Branch Management API provides endpoints for managing business branches, including their performance metrics, inventory, and employees.

## Base URL
```
http://localhost:5000/api/v1/branches
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Get All Branches
Retrieve a list of all branches with pagination and filtering.

```http
GET /
```

#### Query Parameters
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `status`: Filter by status
- `search`: Search by name or address
- `sort`: Sort by field (name, created_at, etc.)
- `order`: Sort order (asc/desc)

#### Response
```json
{
    "branches": [
        {
            "id": 1,
            "name": "Main Branch",
            "address": "123 Main St",
            "phone": "555-0123",
            "email": "main@example.com",
            "manager_id": 1,
            "status": "active",
            "created_at": "2024-03-30T12:00:00Z",
            "total_employees": 10,
            "total_sales": 50000
        }
    ],
    "total": 50,
    "pages": 5,
    "current_page": 1
}
```

### Get Branch
Retrieve details of a specific branch.

```http
GET /{branch_id}
```

#### Response
```json
{
    "id": 1,
    "name": "Main Branch",
    "address": "123 Main St",
    "phone": "555-0123",
    "email": "main@example.com",
    "manager_id": 1,
    "manager": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    },
    "status": "active",
    "created_at": "2024-03-30T12:00:00Z",
    "total_employees": 10,
    "total_sales": 50000,
    "inventory_value": 25000
}
```

### Create Branch
Create a new branch.

```http
POST /
```

#### Request Body
```json
{
    "name": "Downtown Branch",
    "address": "456 Downtown Ave",
    "phone": "555-0124",
    "email": "downtown@example.com",
    "manager_id": 2
}
```

#### Response
```json
{
    "message": "Branch created successfully",
    "branch": {
        "id": 2,
        "name": "Downtown Branch",
        "address": "456 Downtown Ave",
        "phone": "555-0124",
        "email": "downtown@example.com",
        "manager_id": 2,
        "status": "active"
    }
}
```

### Update Branch
Update an existing branch's information.

```http
PUT /{branch_id}
```

#### Request Body
```json
{
    "name": "Downtown Branch",
    "address": "456 Downtown Ave",
    "phone": "555-0124",
    "email": "downtown@example.com",
    "manager_id": 2,
    "status": "active"
}
```

#### Response
```json
{
    "message": "Branch updated successfully",
    "branch": {
        "id": 2,
        "name": "Downtown Branch",
        "address": "456 Downtown Ave",
        "phone": "555-0124",
        "email": "downtown@example.com",
        "manager_id": 2,
        "status": "active"
    }
}
```

### Delete Branch
Delete a branch.

```http
DELETE /{branch_id}
```

#### Response
```json
{
    "message": "Branch deleted successfully"
}
```

### Get Branch Performance
Retrieve performance metrics for a specific branch.

```http
GET /{branch_id}/performance
```

#### Query Parameters
- `start_date`: Start date for metrics (YYYY-MM-DD)
- `end_date`: End date for metrics (YYYY-MM-DD)
- `metrics`: Comma-separated list of metrics to include

#### Response
```json
{
    "branch_id": 1,
    "period": {
        "start": "2024-03-01",
        "end": "2024-03-30"
    },
    "metrics": {
        "total_sales": 50000,
        "total_orders": 250,
        "average_order_value": 200,
        "total_customers": 150,
        "new_customers": 30,
        "inventory_turnover": 2.5,
        "employee_productivity": 5000
    },
    "trends": {
        "daily_sales": [
            {
                "date": "2024-03-30",
                "value": 2000
            }
        ]
    }
}
```

### Get Branch Inventory
Retrieve inventory information for a specific branch.

```http
GET /{branch_id}/inventory
```

#### Query Parameters
- `category`: Filter by product category
- `low_stock`: Filter low stock items only
- `sort`: Sort by field (quantity, name, etc.)
- `order`: Sort order (asc/desc)

#### Response
```json
{
    "branch_id": 1,
    "total_items": 100,
    "total_value": 25000,
    "low_stock_items": 5,
    "out_of_stock_items": 2,
    "inventory": [
        {
            "product_id": 1,
            "name": "Product Name",
            "category": "Electronics",
            "quantity": 50,
            "reorder_point": 20,
            "unit_price": 100,
            "total_value": 5000
        }
    ]
}
```

### Get Branch Employees
Retrieve list of employees working at a specific branch.

```http
GET /{branch_id}/employees
```

#### Query Parameters
- `role`: Filter by employee role
- `status`: Filter by employee status
- `search`: Search by name or email

#### Response
```json
{
    "branch_id": 1,
    "total_employees": 10,
    "employees": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "manager",
            "status": "active",
            "hire_date": "2024-01-01"
        }
    ]
}
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Invalid input",
    "message": "Name is required"
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
    "message": "Branch not found"
}
```

### 409 Conflict
```json
{
    "error": "Conflict",
    "message": "Branch name already exists"
}
```

## Rate Limiting
- GET requests: 100 per minute
- POST/PUT/DELETE requests: 20 per minute

## Security
- All endpoints require authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting to prevent abuse 