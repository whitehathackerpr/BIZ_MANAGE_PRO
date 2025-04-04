# Development Setup Guide

This guide will help you set up the development environment for the BIZ_MANAGE_PRO project.

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git
- Docker (optional)
- Docker Compose (optional)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO
```

### 2. Backend Setup

#### Create and Activate Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

#### Initialize Database

```bash
python init_db.py
```

#### Run Migrations

```bash
alembic upgrade head
```

#### Start Development Server

```bash
python run.py
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

#### Start Development Server

```bash
npm run dev
```

## Development Tools

### Code Style

- Backend: Use Black for Python code formatting
- Frontend: Use Prettier for JavaScript/TypeScript code formatting

### Linting

- Backend: Use Flake8 for Python linting
- Frontend: Use ESLint for JavaScript/TypeScript linting

### Testing

- Backend: Use pytest for Python testing
- Frontend: Use Jest for JavaScript/TypeScript testing

### Debugging

- Backend: Use pdb or VS Code debugger
- Frontend: Use React Developer Tools and Chrome DevTools

## Development Workflow

1. Create a new branch for your feature/fix
2. Make your changes
3. Run tests
4. Format code
5. Lint code
6. Commit changes
7. Push to remote
8. Create pull request

## Common Development Tasks

### Backend

#### Create a New Model

1. Create a new file in `app/models/`
2. Define the model class
3. Add to `app/models/__init__.py`
4. Create migration: `alembic revision --autogenerate -m "description"`
5. Apply migration: `alembic upgrade head`

#### Create a New API Endpoint

1. Create a new file in `app/routes/`
2. Define the router and endpoints
3. Add to `main.py`

#### Run Tests

```bash
pytest
```

### Frontend

#### Create a New Component

1. Create a new file in `src/components/`
2. Define the component
3. Export the component
4. Import and use in pages

#### Create a New Page

1. Create a new file in `src/pages/`
2. Define the page component
3. Add to `src/routes.jsx`

#### Run Tests

```bash
npm test
```

## Troubleshooting

### Backend Issues

#### Database Connection Issues

1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Check database URL format

#### Migration Issues

1. Check migration files
2. Verify model changes
3. Try `alembic upgrade head --sql` to see SQL

### Frontend Issues

#### Build Issues

1. Clear node_modules: `rm -rf node_modules`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `npm install`

#### Hot Reload Issues

1. Check file changes are being detected
2. Verify webpack configuration
3. Restart development server

## Best Practices

### Backend

- Use type hints
- Write docstrings
- Follow PEP 8
- Use async/await properly
- Handle errors gracefully
- Write tests
- Use logging

### Frontend

- Use functional components
- Follow React hooks rules
- Use proper state management
- Handle errors gracefully
- Write tests
- Use proper prop types
- Follow accessibility guidelines

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/) 