from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo received message (for demo); in real use, push notifications from backend
            await manager.send_message(f"Notification: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Utility for other endpoints to trigger notifications
async def broadcast_notification(message: str):
    await manager.send_message(message)

@router.post("/trigger-notification")
async def trigger_notification(request: Request):
    data = await request.json()
    message = data.get("message", "Test notification!")
    await broadcast_notification(message)
    return {"status": "sent", "message": message}

@router.post("/trigger-low-stock")
async def trigger_low_stock(request: Request):
    data = await request.json()
    product = data.get("product", "Unknown Product")
    await broadcast_notification(f"Low stock alert: {product} is running low!")
    return {"status": "sent", "message": f"Low stock alert: {product}"}

@router.post("/trigger-new-user")
async def trigger_new_user(request: Request):
    data = await request.json()
    email = data.get("email", "new user")
    await broadcast_notification(f"New user registered: {email}")
    return {"status": "sent", "message": f"New user registered: {email}"}

@router.post("/trigger-product-review")
async def trigger_product_review(request: Request):
    data = await request.json()
    product = data.get("product", "Unknown Product")
    reviewer = data.get("reviewer", "A user")
    await broadcast_notification(f"New review submitted for {product} by {reviewer}!")
    return {"status": "sent", "message": f"New review submitted for {product} by {reviewer}!"}

@router.post("/trigger-supplier-delivery")
async def trigger_supplier_delivery(request: Request):
    data = await request.json()
    supplier = data.get("supplier", "A supplier")
    product = data.get("product", "Unknown Product")
    await broadcast_notification(f"Supplier {supplier} delivered {product}!")
    return {"status": "sent", "message": f"Supplier {supplier} delivered {product}!"} 