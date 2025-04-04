from fastapi import APIRouter
from .endpoints import (
    auth,
    users,
    roles,
    permissions,
    products,
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

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(branch.router, prefix="/branch", tags=["branch"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"]) 