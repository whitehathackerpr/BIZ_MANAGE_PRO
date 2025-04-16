# BIZ_MANAGE_PRO Backend

This is the backend server for the BIZ_MANAGE_PRO application. It integrates both FastAPI and Flask frameworks to provide a comprehensive API for business management.

## Features

- Unified server that combines both FastAPI and Flask components
- Comprehensive API for business operations
- Authentication and authorization
- Product and inventory management
- Sales and analytics
- User and role management
- WebSocket support for real-time notifications

## Getting Started

### Prerequisites

- Python 3.8 or higher
- PostgreSQL (or compatible database)
- Redis (for caching and rate limiting)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO/backend
```

2. Set up a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on the `.env.example` file:
```bash
cp .env.example .env
# Edit the .env file with your configuration
```

5. Run database migrations:
```bash
python run.py migrate
```

### Running the Server

You can run the server using the provided shell script:

```bash
./start_server.sh
```

Or manually:

```bash
python main.py
```

The server will start at http://localhost:8000.

## API Documentation

- FastAPI Swagger Documentation: http://localhost:8000/docs
- Legacy API Documentation: http://localhost:8000/api/legacy/docs

## Development

This backend is currently in a transitional state, migrating from Flask to FastAPI. The integration approach allows both frameworks to operate simultaneously while the migration progresses.

### Migration Status

See the `MIGRATION_TODO.md` file for details on the migration status and remaining tasks.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 