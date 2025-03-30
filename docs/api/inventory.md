# Inventory Management API Documentation

## Overview
The Inventory Management API provides endpoints for managing product inventory across branches, including stock levels, transfers, and analytics.

## Base URL
```
http://localhost:5000/api/v1/inventory
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Get All Products
Retrieve a list of all products with pagination and filtering.

```http
GET /products
```

#### Query Parameters
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)
- `category`: Filter by category
- `branch_id`: Filter by branch
- `search`: Search by name or SKU
- `sort`: Sort by field (name, quantity, etc.)
- `order`: Sort order (asc/desc)

#### Response
```json
{
    "products": [
        {
            "id": 1,
            "name": "Product Name",
            "sku": "SKU123",
            "category": "Electronics",
            "description": "Product description",
            "unit_price": 100,
            "reorder_point": 20,
            "total_quantity": 150,
            "branch_quantities": [
                {
                    "branch_id": 1,
                    "quantity": 100
                },
                {
                    "branch_id": 2,
                    "quantity": 50
                }
            ]
        }
    ],
    "total": 50,
    "pages": 5,
    "current_page": 1
}
```

### Get Product
Retrieve details of a specific product.

```http
GET /products/{product_id}
```

#### Response
```json
{
    "id": 1,
    "name": "Product Name",
    "sku": "SKU123",
    "category": "Electronics",
    "description": "Product description",
    "unit_price": 100,
    "reorder_point": 20,
    "total_quantity": 150,
    "branch_quantities": [
        {
            "branch_id": 1,
            "branch_name": "Main Branch",
            "quantity": 100
        },
        {
            "branch_id": 2,
            "branch_name": "Downtown Branch",
            "quantity": 50
        }
    ],
    "stock_history": [
        {
            "date": "2024-03-30",
            "type": "purchase",
            "quantity": 50,
            "branch_id": 1
        }
    ]
}
```

### Create Product
Create a new product.

```http
POST /products
```

#### Request Body
```json
{
    "name": "New Product",
    "sku": "SKU124",
    "category": "Electronics",
    "description": "Product description",
    "unit_price": 100,
    "reorder_point": 20,
    "initial_quantities": [
        {
            "branch_id": 1,
            "quantity": 100
        }
    ]
}
```

#### Response
```json
{
    "message": "Product created successfully",
    "product": {
        "id": 2,
        "name": "New Product",
        "sku": "SKU124",
        "category": "Electronics",
        "description": "Product description",
        "unit_price": 100,
        "reorder_point": 20,
        "total_quantity": 100
    }
}
```

### Update Product
Update an existing product's information.

```http
PUT /products/{product_id}
```

#### Request Body
```json
{
    "name": "Updated Product",
    "description": "Updated description",
    "unit_price": 120,
    "reorder_point": 25
}
```

#### Response
```json
{
    "message": "Product updated successfully",
    "product": {
        "id": 2,
        "name": "Updated Product",
        "sku": "SKU124",
        "category": "Electronics",
        "description": "Updated description",
        "unit_price": 120,
        "reorder_point": 25,
        "total_quantity": 100
    }
}
```

### Delete Product
Delete a product.

```http
DELETE /products/{product_id}
```

#### Response
```json
{
    "message": "Product deleted successfully"
}
```

### Update Stock
Update product stock levels.

```http
POST /products/{product_id}/stock
```

#### Request Body
```json
{
    "branch_id": 1,
    "quantity": 50,
    "type": "purchase",
    "notes": "Stock purchase from supplier"
}
```

#### Response
```json
{
    "message": "Stock updated successfully",
    "product": {
        "id": 1,
        "name": "Product Name",
        "total_quantity": 200,
        "branch_quantities": [
            {
                "branch_id": 1,
                "quantity": 150
            }
        ]
    }
}
```

### Transfer Stock
Transfer stock between branches.

```http
POST /transfers
```

#### Request Body
```json
{
    "product_id": 1,
    "from_branch_id": 1,
    "to_branch_id": 2,
    "quantity": 20,
    "notes": "Transfer to downtown branch"
}
```

#### Response
```json
{
    "message": "Stock transferred successfully",
    "transfer": {
        "id": 1,
        "product_id": 1,
        "from_branch_id": 1,
        "to_branch_id": 2,
        "quantity": 20,
        "status": "completed",
        "created_at": "2024-03-30T12:00:00Z"
    }
}
```

### Get Stock Alerts
Retrieve low stock and out of stock alerts.

```http
GET /alerts
```

#### Query Parameters
- `branch_id`: Filter by branch
- `severity`: Filter by alert severity (low_stock, out_of_stock)
- `category`: Filter by product category

#### Response
```json
{
    "alerts": [
        {
            "product_id": 1,
            "name": "Product Name",
            "branch_id": 1,
            "branch_name": "Main Branch",
            "current_quantity": 15,
            "reorder_point": 20,
            "severity": "low_stock",
            "last_updated": "2024-03-30T12:00:00Z"
        }
    ],
    "total_alerts": 5,
    "low_stock_count": 3,
    "out_of_stock_count": 2
}
```

### Get Stock Analytics
Retrieve inventory analytics and metrics.

```http
GET /analytics
```

#### Query Parameters
- `branch_id`: Filter by branch
- `start_date`: Start date for metrics (YYYY-MM-DD)
- `end_date`: End date for metrics (YYYY-MM-DD)

#### Response
```json
{
    "period": {
        "start": "2024-03-01",
        "end": "2024-03-30"
    },
    "metrics": {
        "total_products": 100,
        "total_value": 25000,
        "low_stock_items": 5,
        "out_of_stock_items": 2,
        "average_stock_level": 50,
        "stock_turnover_rate": 2.5
    },
    "category_distribution": [
        {
            "category": "Electronics",
            "count": 30,
            "value": 15000
        }
    ],
    "stock_movements": [
        {
            "date": "2024-03-30",
            "purchases": 50,
            "sales": 30,
            "transfers_in": 20,
            "transfers_out": 10
        }
    ]
}
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Invalid input",
    "message": "Quantity must be greater than 0"
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
    "message": "Product not found"
}
```

### 409 Conflict
```json
{
    "error": "Conflict",
    "message": "Insufficient stock for transfer"
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