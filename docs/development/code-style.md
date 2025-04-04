# Code Style Guide

This guide outlines the coding standards and best practices for the BIZ_MANAGE_PRO project.

## General Principles

- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Use meaningful names for variables, functions, and classes
- Write self-documenting code
- Add comments only when necessary
- Keep functions and classes small and focused
- Follow the Single Responsibility Principle

## Backend (Python)

### Code Formatting

- Use Black for code formatting
- Line length: 88 characters
- Use 4 spaces for indentation
- Use double quotes for strings
- Use trailing commas in multi-line lists/dicts
- Use parentheses for line continuation

### Naming Conventions

- Use snake_case for variables, functions, and modules
- Use PascalCase for classes
- Use UPPER_CASE for constants
- Use _prefix for private variables/methods
- Use __prefix for name mangling

### Imports

- Group imports in this order:
  1. Standard library imports
  2. Third-party imports
  3. Local application imports
- Use absolute imports
- Avoid wildcard imports
- Sort imports alphabetically

### Documentation

- Use Google-style docstrings
- Document all public functions, classes, and methods
- Include type hints
- Document exceptions
- Document return values

### Example

```python
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

class UserCreate(BaseModel):
    """User creation model."""
    email: str
    password: str
    full_name: str

class UserResponse(BaseModel):
    """User response model."""
    id: int
    email: str
    full_name: str
    is_active: bool

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create a new user.
    
    Args:
        user: User creation data
        db: Database session
    
    Returns:
        Created user data
    
    Raises:
        HTTPException: If user already exists
    """
    try:
        db_user = await create_user_in_db(db, user)
        return UserResponse.from_orm(db_user)
    except UserExistsError:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )
```

## Frontend (React)

### Code Formatting

- Use Prettier for code formatting
- Line length: 80 characters
- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas in multi-line objects/arrays
- Use parentheses for JSX

### Naming Conventions

- Use PascalCase for components
- Use camelCase for variables and functions
- Use UPPER_CASE for constants
- Use _prefix for private variables/functions
- Use kebab-case for CSS classes

### Component Structure

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Use default props when appropriate
- Use proper state management
- Use proper error handling

### Example

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import { Button, TextField } from '@mui/material';

const UserForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    email: '',
    password: '',
    fullName: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
      >
        Submit
      </Button>
    </form>
  );
};

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    fullName: PropTypes.string,
  }),
};

UserForm.defaultProps = {
  initialData: null,
};

export default UserForm;
```

## Testing

### Backend Tests

- Use pytest for testing
- Follow the AAA pattern (Arrange, Act, Assert)
- Use fixtures for common setup
- Use descriptive test names
- Test both success and failure cases
- Use mocking when appropriate

### Frontend Tests

- Use Jest and React Testing Library
- Test component rendering
- Test user interactions
- Test state changes
- Test error handling
- Use mocking for API calls

## Git Commit Messages

- Use present tense
- Start with a verb
- Be concise but descriptive
- Reference issue numbers when applicable
- Follow the format: `<type>(<scope>): <description>`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test changes
- chore: Maintenance tasks

Example:
```
feat(auth): add JWT authentication
fix(api): handle database connection errors
docs(readme): update installation instructions
```

## Code Review Guidelines

- Review for functionality
- Review for code style
- Review for security
- Review for performance
- Review for maintainability
- Provide constructive feedback
- Suggest improvements
- Be respectful and professional

## Resources

- [PEP 8 -- Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Style Guide](https://reactjs.org/docs/code-splitting.html)
- [Git Commit Message Convention](https://www.conventionalcommits.org/) 