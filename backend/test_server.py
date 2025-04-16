import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.extensions import Base, engine
from app.auth.routes import router as auth_router

# Create FastAPI application
app = FastAPI(
    title="BIZ_MANAGE_PRO Auth Test",
    version="1.0.0",
    description="Test server for auth module"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router, prefix="/api/v1")

# Create database tables
Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Auth test server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 