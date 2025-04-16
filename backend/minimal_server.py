import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Import all models first to ensure they are properly defined
print("Testing models import...")
try:
    from app.models import (
        User, Role, Branch, Product, Category, 
        Order, OrderItem, Payment, Sale, SaleItem, 
        Supplier, Address, Employee, 
        IntegrationProvider, IntegrationInstance, IntegrationLog,
        Transaction, TransactionCategory,
        Business, SystemSetting, Notification
    )
    print("✓ Successfully imported all models")
except Exception as e:
    print(f"❌ Error importing models: {str(e)}")
    raise

# Now try to import the auth components
print("\nTesting auth module import...")
try:
    from app.auth.jwt import create_access_token, decode_token, get_current_user
    print("✓ Successfully imported JWT functions")
    
    from app.config import settings
    from app.extensions import Base, engine
    
    # Initialize database (create tables)
    Base.metadata.create_all(bind=engine)
    
    from app.auth.routes import router as auth_router
    
    # Include auth router
    app.include_router(auth_router, prefix="/api/v1")
    print("✓ Successfully imported and setup auth router")
except Exception as e:
    print(f"❌ Error importing auth components: {str(e)}")
    import traceback
    traceback.print_exc()
    raise

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Minimal server is running"}

print("\n✓ Setup complete! Starting server...")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 