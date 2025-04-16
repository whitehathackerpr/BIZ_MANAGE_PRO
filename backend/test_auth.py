"""
Test script to verify JWT authentication functionality.

This script provides a simple way to test the JWT authentication endpoints
without setting up a full test suite.

Run this script with:
    python test_auth.py
"""

import httpx
import json
import asyncio
from pprint import pprint
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

BASE_URL = "http://localhost:8000/api/v1/auth"

async def test_authentication():
    """Test the JWT authentication flow"""
    async with httpx.AsyncClient() as client:
        # Step 1: Register a new user
        print("\n============ REGISTER TEST ============")
        register_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "securepassword"
        }
        
        try:
            response = await client.post(f"{BASE_URL}/register", json=register_data)
            print(f"Status Code: {response.status_code}")
            print("Response:")
            pprint(response.json())
        except Exception as e:
            print(f"Error during registration: {e}")
            # Continue with login even if registration fails (user might already exist)
            
        # Step 2: Login with the user credentials
        print("\n============ LOGIN TEST ============")
        login_data = {
            "email": "test@example.com",
            "password": "securepassword"
        }
        
        try:
            response = await client.post(f"{BASE_URL}/login", json=login_data)
            print(f"Status Code: {response.status_code}")
            print("Response:")
            pprint(response.json())
            
            # Continue only if login was successful
            if response.status_code == 200:
                tokens = response.json()
                access_token = tokens["access_token"]
                refresh_token = tokens["refresh_token"]
                
                # Step 3: Get current user info with the access token
                print("\n============ GET CURRENT USER TEST ============")
                headers = {"Authorization": f"Bearer {access_token}"}
                
                try:
                    response = await client.get(f"{BASE_URL}/me", headers=headers)
                    print(f"Status Code: {response.status_code}")
                    print("Response:")
                    pprint(response.json())
                except Exception as e:
                    print(f"Error getting current user: {e}")
                
                # Step 4: Refresh token
                print("\n============ REFRESH TOKEN TEST ============")
                headers = {"Authorization": f"Bearer {refresh_token}"}
                
                try:
                    response = await client.post(f"{BASE_URL}/refresh", headers=headers)
                    print(f"Status Code: {response.status_code}")
                    print("Response:")
                    pprint(response.json())
                except Exception as e:
                    print(f"Error refreshing token: {e}")
                
                # Step 5: Test invalid token
                print("\n============ INVALID TOKEN TEST ============")
                headers = {"Authorization": "Bearer invalid_token"}
                
                try:
                    response = await client.get(f"{BASE_URL}/me", headers=headers)
                    print(f"Status Code: {response.status_code}")
                    print("Response:")
                    pprint(response.json())
                except Exception as e:
                    print(f"Error with invalid token: {e}")
                
                # Step 6: Test logout (just for API completeness)
                print("\n============ LOGOUT TEST ============")
                valid_headers = {"Authorization": f"Bearer {access_token}"}
                
                try:
                    response = await client.post(f"{BASE_URL}/logout", headers=valid_headers)
                    print(f"Status Code: {response.status_code}")
                    print("Response:")
                    pprint(response.json())
                except Exception as e:
                    print(f"Error during logout: {e}")
            
        except Exception as e:
            print(f"Error during login: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 