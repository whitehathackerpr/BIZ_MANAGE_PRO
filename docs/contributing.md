# Contributing Guidelines

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO
```

3. Set up your development environment:
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

4. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Code Style

#### Python (Backend)
- Follow PEP 8 guidelines
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for all functions and classes

Example:
```python
def calculate_total(items: List[Dict[str, Any]]) -> float:
    """
    Calculate the total price of items.

    Args:
        items: List of items with price information

    Returns:
        float: Total price of all items
    """
    return sum(item['price'] for item in items)
```

#### JavaScript/TypeScript (Frontend)
- Follow ESLint configuration
- Use TypeScript for type safety
- Maximum line length: 100 characters
- Use JSDoc for documentation

Example:
```typescript
/**
 * Calculate the total price of items
 * @param {Array<{price: number}>} items - List of items with price information
 * @returns {number} Total price of all items
 */
const calculateTotal = (items: Array<{price: number}>): number => {
    return items.reduce((sum, item) => sum + item.price, 0);
};
```

### 2. Git Workflow

1. Keep your branch up to date:
```bash
git fetch origin
git rebase origin/main
```

2. Make atomic commits:
```bash
git add .
git commit -m "feat: add new feature X"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

### 3. Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Example:
```
feat(auth): add OAuth2 authentication

- Add Google OAuth2 provider
- Implement JWT token generation
- Add user profile endpoint

Closes #123
```

### 4. Testing

#### Backend Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app tests/
```

#### Frontend Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/Button.test.tsx

# Run with coverage
npm test -- --coverage
```

### 5. Documentation

1. Update API documentation:
```bash
# Generate OpenAPI documentation
flask openapi generate
```

2. Update README if needed:
```bash
# Check for dead links
npm run check-links
```

### 6. Pull Request Process

1. Create a Pull Request:
   - Use the PR template
   - Link related issues
   - Add screenshots for UI changes

2. PR Review Checklist:
   - [ ] Code follows style guidelines
   - [ ] Tests are added/updated
   - [ ] Documentation is updated
   - [ ] No breaking changes
   - [ ] All CI checks pass

3. Address review comments:
```bash
git add .
git commit -m "fix: address review comments"
git push origin feature/your-feature-name
```

### 7. Code Review Guidelines

1. Review Checklist:
   - Code quality and style
   - Test coverage
   - Documentation
   - Performance implications
   - Security considerations

2. Review Comments:
   - Be constructive and specific
   - Explain the reasoning
   - Suggest improvements
   - Use code snippets when helpful

### 8. Release Process

1. Version Bumping:
```bash
# Update version in package.json
npm version patch|minor|major

# Update version in setup.py
bumpversion patch|minor|major
```

2. Changelog:
```bash
# Generate changelog
npm run changelog
```

3. Release Notes:
- List major changes
- Document breaking changes
- Include upgrade instructions

## Project Structure

```
BIZ_MANAGE_PRO/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
└── docs/
```

## Development Tools

### IDE Setup

1. VS Code Extensions:
   - ESLint
   - Prettier
   - Python
   - GitLens
   - Docker

2. Editor Config:
```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,css,json}]
indent_style = space
indent_size = 2

[*.py]
indent_style = space
indent_size = 4
```

### Git Hooks

1. Pre-commit Hook:
```bash
#!/bin/sh
npm run lint
npm run test
```

2. Commit Message Hook:
```bash
#!/bin/sh
npx commitlint --edit $1
```

## Getting Help

1. Check existing issues
2. Join our Slack channel
3. Contact maintainers
4. Create a new issue

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md
- Release notes
- Project website

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 