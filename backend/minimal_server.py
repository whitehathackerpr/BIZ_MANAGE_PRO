import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.extensions import Base, engine

# Create FastAPI application
app = FastAPI(
    title="BIZ_MANAGE_PRO Minimal Server",
    version="1.0.0",
    description="Minimal server for testing auth"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import only the auth router
from app.auth.routes import router as auth_router

# Include auth router
app.include_router(auth_router, prefix="/api/v1")

# Create database tables
Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Minimal server is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 