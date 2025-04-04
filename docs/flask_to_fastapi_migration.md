# Migration Guide: Flask to FastAPI

This document details the migration process from Flask to FastAPI for the BIZ_MANAGE_PRO application. It outlines the key changes, benefits, and potential challenges when transitioning between these frameworks.

## Why FastAPI?

FastAPI offers several advantages over Flask:

1. **Performance**: FastAPI is built on Starlette and Uvicorn, providing high performance with async support.
2. **Type Checking**: Integrated Pydantic models for request/response validation and automatic type checking.
3. **Automatic Documentation**: OpenAPI and Swagger UI integration out of the box.
4. **Modern Python Features**: Support for Python 3.7+ features including async/await.
5. **Developer Experience**: Better editor support with type hints and auto-completion.

## Key Migration Changes

### 1. Application Structure

**Flask**:
```python
from flask import Flask, Blueprint

app = Flask(__name__)
bp = Blueprint("users", __name__)

@bp.route("/users", methods=["GET"])
def get_users():
    # ...
    return jsonify({"users": users})

app.register_blueprint(bp, url_prefix="/api")
```

**FastAPI**:
```python
from fastapi import FastAPI, APIRouter

app = FastAPI()
router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def get_users():
    # ...
    return {"users": users}

app.include_router(router, prefix="/api")
```

### 2. Request Validation

**Flask**:
```python
@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    # Manual validation
    if not data.get("username"):
        return jsonify({"error": "Username is required"}), 400
    # ...
```

**FastAPI**:
```python
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Validation is automatic
    # ...
```

### 3. Authentication

**Flask with Flask-JWT-Extended**:
```python
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

jwt = JWTManager(app)

@bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    # ...
```

**FastAPI with fastapi-jwt-extended**:
```python
from fastapi_jwt_extended import JWTManager, jwt_required, get_jwt_identity

jwt = JWTManager(app)

@router.get("/protected")
@jwt_required()
async def protected():
    current_user = get_jwt_identity()
    # ...
```

### 4. Database Integration

**Flask with SQLAlchemy**:
```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    # ...
```

**FastAPI with SQLAlchemy**:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    # ...
```

### 5. Error Handling

**Flask**:
```python
@bp.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

# In route
if not user:
    return jsonify({"error": "User not found"}), 404
```

**FastAPI**:
```python
from fastapi import HTTPException

# In route
if not user:
    raise HTTPException(status_code=404, detail="User not found")
```

## Migration Steps

1. **Update Dependencies**:
   - Add FastAPI and related packages to requirements.txt
   - Remove Flask-specific packages that are no longer needed

2. **Route Updates**:
   - Convert Blueprint routes to APIRouter
   - Update route decorators (@bp.route to @router.get, @router.post, etc.)
   - Add response_model to route decorators

3. **Request Validation**:
   - Create Pydantic models for request validation
   - Replace manual validation with Pydantic models

4. **Response Handling**:
   - Create Pydantic models for response serialization
   - Use response_model in route decorators

5. **Error Handling**:
   - Replace Flask error responses with HTTPException
   - Update error handling middleware

6. **Authentication**:
   - Update JWT authentication to use fastapi-jwt-extended
   - Modify token generation and validation

7. **Database Operations**:
   - Update SQLAlchemy usage for async support
   - Implement dependency injection for database sessions

8. **Testing**:
   - Update tests to use FastAPI TestClient
   - Adjust test fixtures for async support

## Potential Challenges

1. **Async/Await Conversion**: Converting synchronous code to asynchronous may require significant changes.
2. **Third-Party Extensions**: Not all Flask extensions have FastAPI equivalents.
3. **Migration Process**: The migration should be done incrementally to minimize disruption.
4. **Learning Curve**: FastAPI introduces new concepts like dependency injection and Pydantic models.

## Benefits After Migration

1. **Performance**: Improved request handling with async support.
2. **Documentation**: Automatic OpenAPI documentation with Swagger UI.
3. **Code Quality**: Better type checking and validation with Pydantic models.
4. **Maintainability**: More structured code with dependency injection.
5. **Developer Experience**: Better IDE support with type hints.

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html)
- [fastapi-jwt-extended Documentation](https://github.com/piccolomo/fastapi-jwt-extended)

## Example Files Before and After Migration

### Example: User Routes

**Before (Flask)**:
```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, db

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    users = User.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "users": [user.to_dict() for user in users.items],
        "meta": {
            "page": users.page,
            "per_page": users.per_page,
            "total": users.total,
            "pages": users.pages
        }
    })

@users_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_user(id):
    user = User.query.get(id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict())

@users_bp.route("/", methods=["POST"])
@jwt_required()
def create_user():
    data = request.get_json()
    
    if not data.get("username"):
        return jsonify({"error": "Username is required"}), 400
        
    if not data.get("email"):
        return jsonify({"error": "Email is required"}), 400
        
    if not data.get("password"):
        return jsonify({"error": "Password is required"}), 400
        
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400
        
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400
        
    user = User(
        username=data["username"],
        email=data["email"]
    )
    user.set_password(data["password"])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201
```

**After (FastAPI)**:
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.db import get_db
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    
    class Config:
        orm_mode = True

class PaginatedResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    per_page: int
    pages: int

@router.get("/", response_model=PaginatedResponse)
@jwt_required()
async def get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * per_page
    
    # Get total count
    result = await db.execute(select(func.count()).select_from(User))
    total = result.scalar()
    
    # Get paginated users
    result = await db.execute(
        select(User)
        .offset(offset)
        .limit(per_page)
    )
    users = result.scalars().all()
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }

@router.get("/{id}", response_model=UserResponse)
@jwt_required()
async def get_user(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.id == id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

@router.post("/", response_model=UserResponse, status_code=201)
@jwt_required()
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if username exists
    result = await db.execute(
        select(User).filter(User.username == user_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )
        
    # Check if email exists
    result = await db.execute(
        select(User).filter(User.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )
        
    user = User(
        username=user_data.username,
        email=user_data.email
    )
    user.set_password(user_data.password)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user
```

## Conclusion

Migrating from Flask to FastAPI requires effort but offers significant benefits in performance, documentation, and developer experience. The key is to approach the migration incrementally, focusing on core functionality first, then gradually expanding to other parts of the application.

The BIZ_MANAGE_PRO application has been successfully migrated to FastAPI, resulting in improved performance, better documentation, and enhanced developer experience.