# Testing Guide

This guide outlines the testing strategy and best practices for the BIZ_MANAGE_PRO project.

## Testing Strategy

### Test Types

1. Unit Tests
   - Test individual components/functions
   - Fast execution
   - Isolated from dependencies
   - High coverage

2. Integration Tests
   - Test component interactions
   - Test API endpoints
   - Test database operations
   - Test external service integration

3. End-to-End Tests
   - Test complete user flows
   - Test critical paths
   - Test UI interactions
   - Test real-world scenarios

4. Performance Tests
   - Test response times
   - Test load handling
   - Test resource usage
   - Test scalability

5. Security Tests
   - Test authentication
   - Test authorization
   - Test input validation
   - Test data protection

## Backend Testing

### Setup

1. Install dependencies:
```bash
pip install -r requirements-dev.txt
```

2. Create test database:
```bash
createdb biz_manage_pro_test
```

3. Set up test environment:
```bash
export TESTING=True
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/biz_manage_pro_test
```

### Test Structure

```
tests/
├── __init__.py
├── conftest.py
├── test_models/
│   ├── __init__.py
│   ├── test_user.py
│   ├── test_product.py
│   └── ...
├── test_api/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── ...
├── test_integration/
│   ├── __init__.py
│   ├── test_db.py
│   ├── test_redis.py
│   └── ...
└── test_utils/
    ├── __init__.py
    ├── test_validators.py
    └── ...
```

### Example Test

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models import User
from app.schemas import UserCreate

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    # Setup test database session
    session = Session()
    yield session
    session.rollback()
    session.close()

def test_create_user(client, db_session):
    # Test data
    user_data = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    
    # Make request
    response = client.post("/api/users/", json=user_data)
    
    # Assert response
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["full_name"] == user_data["full_name"]
    assert "id" in data
    
    # Assert database
    user = db_session.query(User).filter_by(email=user_data["email"]).first()
    assert user is not None
    assert user.full_name == user_data["full_name"]
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_api/test_users.py

# Run tests with coverage
pytest --cov=app tests/

# Run tests with verbose output
pytest -v

# Run tests with specific marker
pytest -m "integration"
```

## Frontend Testing

### Setup

1. Install dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

2. Add test scripts to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── UserForm.test.jsx
│   │   ├── ProductList.test.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── Login.test.jsx
│   │   ├── Dashboard.test.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.test.js
│   │   ├── useProducts.test.js
│   │   └── ...
│   └── utils/
│       ├── validators.test.js
│       └── ...
└── ...
```

### Example Test

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserForm from '../components/UserForm';

describe('UserForm', () => {
  const mockSubmit = jest.fn();
  
  beforeEach(() => {
    mockSubmit.mockClear();
  });
  
  it('renders form fields', () => {
    render(<UserForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });
  
  it('submits form data', () => {
    render(<UserForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { name: 'email', value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { name: 'password', value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'fullName', value: 'Test User' }
    });
    
    fireEvent.click(screen.getByText(/submit/i));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserForm.test.jsx
```

## End-to-End Testing

### Setup

1. Install dependencies:
```bash
npm install --save-dev cypress
```

2. Add Cypress scripts to package.json:
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

### Test Structure

```
cypress/
├── fixtures/
│   └── example.json
├── integration/
│   ├── auth/
│   │   ├── login.spec.js
│   │   └── register.spec.js
│   ├── products/
│   │   ├── create.spec.js
│   │   └── list.spec.js
│   └── ...
├── plugins/
│   └── index.js
└── support/
    └── commands.js
```

### Example Test

```javascript
describe('User Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  it('logs in successfully', () => {
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=submit-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=welcome-message]').should('contain', 'Welcome');
  });
  
  it('shows error with invalid credentials', () => {
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=submit-button]').click();
    
    cy.get('[data-testid=error-message]').should('be.visible');
  });
});
```

### Running Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all tests headlessly
npm run cypress:run

# Run specific test file
npm run cypress:run -- --spec "cypress/integration/auth/login.spec.js"
```

## Performance Testing

### Setup

1. Install dependencies:
```bash
pip install locust
```

2. Create test file:
```python
from locust import HttpUser, task, between

class BIZManageUser(HttpUser):
    wait_time = between(1, 5)
    
    @task
    def load_dashboard(self):
        self.client.get("/api/dashboard")
    
    @task(3)
    def load_products(self):
        self.client.get("/api/products")
```

### Running Tests

```bash
# Run Locust
locust -f locustfile.py

# Run with specific parameters
locust -f locustfile.py --host=http://localhost:8000 --users=100 --spawn-rate=10
```

## Best Practices

### General

- Write tests before writing code (TDD)
- Keep tests simple and focused
- Use meaningful test names
- Test both success and failure cases
- Use fixtures for test data
- Mock external dependencies
- Keep tests independent
- Run tests frequently

### Backend

- Use pytest fixtures
- Use pytest markers
- Use pytest parametrize
- Use pytest-xdist for parallel testing
- Use pytest-cov for coverage
- Use pytest-mock for mocking
- Use pytest-asyncio for async tests

### Frontend

- Use React Testing Library
- Test component behavior, not implementation
- Use user-event for interactions
- Use jest-dom for DOM testing
- Use MSW for API mocking
- Use Cypress for E2E testing
- Use React DevTools for debugging

### CI/CD

- Run tests on every push
- Run tests on pull requests
- Use GitHub Actions for CI
- Use Codecov for coverage
- Use SonarQube for quality
- Use Snyk for security
- Use Lighthouse for performance

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [Jest Documentation](https://jestjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Locust Documentation](https://docs.locust.io/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/) 