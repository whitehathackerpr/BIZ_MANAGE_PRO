from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    business,
    customers,
    suppliers,
    inventory,
    sales,
    reports,
    notifications,
    performance,
    profile,
    role,
    users,
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Business Management
api_router.include_router(business.router, prefix="/businesses", tags=["business"])

# Customer Management
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])

# Supplier Management
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])

# Inventory Management
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])

# Sales Management
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])

# Reports
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])

# Notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

# Performance Management
api_router.include_router(performance.router, prefix="/performance", tags=["performance"])

# User Profile
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])

# Role Management
api_router.include_router(role.router, prefix="/roles", tags=["roles"])

# User Management
api_router.include_router(users.router, prefix="/users", tags=["users"]) 