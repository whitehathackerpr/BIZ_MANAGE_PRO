from fastapi import APIRouter
from .endpoints import (
    auth,
    users,
    roles,
    permissions,
    products,
    profile,
    password_reset,
    email_verification,
    twofa,
    sales,
    inventory,
    analytics,
    notifications,
    settings,
    branch,
    chat,
    customers,
    websocket
)

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
    responses={401: {"description": "Unauthorized"}}
)

# User management endpoints
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
    responses={401: {"description": "Unauthorized"}}
)

# Role management endpoints
api_router.include_router(
    roles.router,
    prefix="/roles",
    tags=["Roles"],
    responses={401: {"description": "Unauthorized"}}
)

# Permission management endpoints
api_router.include_router(
    permissions.router,
    prefix="/permissions",
    tags=["Permissions"],
    responses={401: {"description": "Unauthorized"}}
)

# Product management endpoints
api_router.include_router(
    products.router,
    prefix="/products",
    tags=["Products"],
    responses={401: {"description": "Unauthorized"}}
)

# Profile management endpoints
api_router.include_router(
    profile.router,
    prefix="/profile",
    tags=["Profile"],
    responses={401: {"description": "Unauthorized"}}
)

# Security endpoints
api_router.include_router(
    password_reset.router,
    prefix="/password-reset",
    tags=["Security"],
    responses={401: {"description": "Unauthorized"}}
)

api_router.include_router(
    email_verification.router,
    prefix="/email-verification",
    tags=["Security"],
    responses={401: {"description": "Unauthorized"}}
)

api_router.include_router(
    twofa.router,
    prefix="/2fa",
    tags=["Security"],
    responses={401: {"description": "Unauthorized"}}
)

# Include all routers
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(branch.router, prefix="/branch", tags=["branch"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"]) 