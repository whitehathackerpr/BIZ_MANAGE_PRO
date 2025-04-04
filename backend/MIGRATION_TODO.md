# Migration TODO List

This document outlines the progress and remaining tasks to complete the migration from Flask to FastAPI.

## Current Status

We have successfully:

1. Set up a minimal FastAPI application with a working health check endpoint
2. Updated some model files to use SQLAlchemy ORM directly instead of Flask-SQLAlchemy
3. Created a simplified structure that allows the application to run without errors
4. Verified that the Swagger documentation is working at /docs

## Model Files to Update

The following model files have been updated from Flask-SQLAlchemy to SQLAlchemy ORM:

- [x] role.py
- [x] branch.py
- [x] product.py
- [x] user.py (was already using SQLAlchemy directly)

These model files still need to be updated:

- [ ] order.py
- [ ] sale.py
- [ ] supplier.py
- [ ] address.py
- [ ] employee.py
- [ ] integration.py
- [ ] transaction.py
- [ ] settings.py
- [ ] notification.py
- [ ] notification_settings.py
- [ ] notifications.py
- [ ] analytics.py
- [ ] audit.py
- [ ] calendar.py
- [ ] communication.py
- [ ] compliance.py
- [ ] document.py
- [ ] environment.py
- [ ] feedback.py
- [ ] health.py
- [ ] maintenance.py
- [ ] quality.py
- [ ] reports.py
- [ ] risk.py
- [ ] services.py
- [ ] security.py
- [ ] task.py
- [ ] training.py
- [ ] users.py
- [ ] workflow.py
- [ ] performance.py

## Route Files

The following route files need to be checked and possibly updated to ensure they're using FastAPI patterns:

- [ ] health.py (already integrated into main.py for testing)
- [ ] auth.py
- [ ] notification_settings.py
- [ ] products.py
- [ ] roles.py
- [ ] sales.py (already updated)
- [ ] settings.py (already updated)
- [ ] analytics.py
- [ ] branch.py
- [ ] chat.py
- [ ] customers.py
- [ ] inventory.py (already updated)
- [ ] notifications.py (already updated) 
- [ ] users.py
- [ ] websocket.py

## Steps for Each Model File

1. Replace `from ..extensions import db` with:
   ```python
   from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey, DateTime, JSON
   from sqlalchemy.orm import relationship, backref
   from ..extensions import Base
   ```

2. Replace `class ModelName(db.Model)` with `class ModelName(Base)`

3. Replace all instances of:
   - `db.Column` with `Column`
   - `db.Integer` with `Integer`
   - `db.String` with `String`
   - `db.Text` with `Text`
   - `db.Float` with `Float`
   - `db.Boolean` with `Boolean`
   - `db.ForeignKey` with `ForeignKey`
   - `db.DateTime` with `DateTime`
   - `db.JSON` with `JSON`
   - `db.relationship` with `relationship`
   - `db.backref` with `backref`

4. Update any other SQLAlchemy related imports as needed

## Steps for Each Route File

1. Ensure the file is using FastAPI's `APIRouter` instead of Flask's `Blueprint`
2. Replace Flask-style route decorators with FastAPI-style decorators
3. Add Pydantic models for request and response validation
4. Update error handling to use FastAPI's `HTTPException`
5. Make route functions async if they interact with the database
6. Update parameter handling to use FastAPI's dependency injection

## Next Steps

1. Progressively update all model files following the pattern above
2. Update the app/__init__.py to gradually include more routers as they become compatible
3. Test each endpoint after updating the corresponding models
4. Update any route files that might still be using Flask patterns
5. Implement database migrations with Alembic
6. Update the main.py file to include the Base.metadata.create_all(engine) call once all models are updated

## Potential Issues to Watch For

1. Circular imports between models
2. Dependency handling in FastAPI routes
3. Database session management
4. Authentication and JWT handling
5. Form data and file uploads
6. WebSocket implementation

## Remaining Tasks

The following tasks need to be completed:

### Authentication System

- Fix the JWT authentication system
  - Use a compatible JWT package (either `fastapi-jwt-auth` or `fastapi-jwt-extended`)
  - Update the token generation and validation functions
  - Ensure the JWT decorators are correctly applied

### Database Models

- Update the remaining database models to use SQLAlchemy ORM (without Flask-SQLAlchemy)
- Ensure all relationships between models are correctly defined
- Add proper type annotations for the models

### Email System

- Update the email system to use `fastapi-mail` instead of Flask-Mail
- Ensure the email templates are correctly rendered

### WebSocket Support

- Update the WebSocket implementation to use FastAPI's native WebSocket support
- Ensure real-time notifications and updates work correctly

### Testing

- Update all tests to use FastAPI's `TestClient` instead of Flask's test client
- Ensure all tests pass with the new implementation

### Documentation

- Update the API documentation to use FastAPI's automatic documentation (Swagger/OpenAPI)
- Update the README and deployment guides to reflect the new FastAPI structure

## Compatibility Issues to Resolve

- **Pydantic version compatibility**: Ensure compatibility between the Pydantic version and the FastAPI version being used
- **SQLAlchemy async support**: Update database operations to use SQLAlchemy's async features where appropriate
- **JWT package compatibility**: Resolve compatibility issues with the JWT package

## Migration Strategy

1. **Incremental approach**: Continue migrating one module at a time
2. **Testing**: Add tests for each migrated module before moving to the next
3. **Documentation**: Update documentation as you go
4. **Dependencies**: Manage dependencies carefully, ensuring compatibility

## Next Steps

1. Create a proper virtual environment for development
2. Install all required dependencies from `requirements.txt`
3. Fix the JWT authentication system
4. Update the remaining model files
5. Start the application with the full FastAPI implementation 