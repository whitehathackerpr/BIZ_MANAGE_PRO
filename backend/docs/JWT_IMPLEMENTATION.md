# JWT Implementation in BIZ_MANAGE_PRO

This document outlines the JWT (JSON Web Token) implementation in the BIZ_MANAGE_PRO application, which provides secure authentication and authorization mechanisms.

## Overview

The JWT implementation has been centralized in the `auth/jwt.py` module, which provides a consistent approach to token creation, validation, and user authentication throughout the application.

## Key Features

- Separate access and refresh tokens
- Token type identification to prevent token misuse
- Comprehensive payload with user information
- Consistent error handling
- Support for both FastAPI and compatibility with Flask-JWT-Extended syntax
- Backward compatibility with legacy code

## Token Structure

### Access Token Payload

```json
{
  "sub": "user@example.com",
  "exp": 1621459200,
  "iat": 1621455600,
  "type": "access",
  "user_id": 123,
  "email": "user@example.com",
  "is_superuser": false,
  "is_active": true
}
```

### Refresh Token Payload

```json
{
  "sub": "user@example.com",
  "exp": 1622064000,
  "iat": 1621455600,
  "type": "refresh",
  "user_id": 123,
  "email": "user@example.com",
  "is_superuser": false,
  "is_active": true
}
```

## Configuration

JWT settings are defined in the application configuration:

```python
# JWT Settings
JWT_SECRET_KEY: str = Field(default="jwt_dev_secret_key_change_in_production")
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
REFRESH_TOKEN_EXPIRE_DAYS: int = 30
```

## Usage

### Creating Tokens

```python
from app.auth.jwt import create_access_token, create_refresh_token

# Create an access token
access_token = create_access_token(
    subject=user.email,
    user_id=user.id,
    email=user.email,
    is_superuser=user.is_admin,
    is_active=user.is_active
)

# Create a refresh token
refresh_token = create_refresh_token(
    subject=user.email,
    user_id=user.id,
    email=user.email,
    is_superuser=user.is_admin,
    is_active=user.is_active
)
```

### Backward Compatibility

For legacy code that uses the old token creation format:

```python
from app.auth.jwt import create_access_token_from_data, create_refresh_token_from_data

# Create tokens using the legacy data dict format
access_token = create_access_token_from_data({
    "sub": str(user.id),
    "email": user.email,
    "is_superuser": user.is_superuser,
    "is_active": user.is_active
})

refresh_token = create_refresh_token_from_data({
    "sub": str(user.id),
    "email": user.email
})
```

### Protecting Routes

```python
from fastapi import Depends
from app.auth.jwt import get_current_user, get_current_active_superuser
from app.models.user import User

@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/admin/settings")
async def admin_settings(current_user: User = Depends(get_current_active_superuser)):
    return {"message": "Admin settings"}
```

## Recent Improvements

The JWT implementation has been recently improved to:

1. Centralize all JWT-related functionality in `auth/jwt.py`
2. Add token type identification to prevent token misuse
3. Ensure compatibility with both FastAPI and Flask-JWT-Extended syntax
4. Improve error handling and response consistency
5. Add comprehensive documentation
6. Provide backward compatibility with legacy code

## Backward Compatibility

To support legacy code that relies on the old API, the following functions are provided:

- `create_access_token_from_data(data: dict)`: Create an access token from a data dictionary
- `create_refresh_token_from_data(data: dict)`: Create a refresh token from a data dictionary
- `decode_refresh_token(token: str)`: Specialized function to decode refresh tokens

These functions serve as a bridge between the old and new API, allowing for a gradual migration to the new pattern.

## Security Considerations

- The JWT secret key should be changed in production
- Access tokens have a short expiration (60 minutes by default)
- Refresh tokens have a longer expiration (30 days by default)
- Token type is enforced to prevent misuse of refresh tokens as access tokens
- User status (active/inactive) is checked during authentication

## Dependencies

- [python-jose](https://github.com/mpdavis/python-jose): For JWT encoding and decoding
- [passlib](https://passlib.readthedocs.io/): For password hashing and verification
- [FastAPI](https://fastapi.tiangolo.com/): For dependency injection and security 