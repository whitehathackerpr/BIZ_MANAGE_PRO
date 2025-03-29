# Business Management System

A comprehensive business management system with features for inventory management, sales tracking, employee management, and analytics.

## Features

- User Authentication and Authorization
- Multi-branch Support
- Inventory Management
- Sales Tracking
- Employee Management
- Customer Management
- Supplier Management
- Analytics and Reporting
- Barcode Integration
- Real-time Notifications
- Email Notifications
- File Upload Support
- API Rate Limiting

## Tech Stack

### Backend
- Python 3.8+
- Flask
- PostgreSQL
- Redis
- SQLAlchemy
- Flask-JWT-Extended
- Flask-SocketIO
- Flask-Mail
- Flask-Limiter

### Frontend
- React
- Material-UI
- Redux
- Chart.js
- Socket.IO Client

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL 12 or higher
- Redis 6 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/biz-manage-pro.git
cd biz-manage-pro
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
# Create the database
createdb biz_manage

# Initialize migrations
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migrations
flask db upgrade

# Initialize database with default data
python init_db.py
```

4. Set up the frontend:
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

1. Start Redis:
```bash
redis-server
```

2. Start the backend (choose one method):

Method 1 - Using Flask CLI:
```bash
cd backend
flask run
```

Method 2 - Using development server:
```bash
cd backend
python dev.py
```

3. Start the frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Development

### Backend Development
```bash
cd backend
flask shell  # For interactive Python shell
flask db migrate -m "migration message"  # For database migrations
flask db upgrade  # To apply migrations
```

### Frontend Development
```bash
cd frontend
npm run build  # For production build
npm test  # For running tests
```

## Troubleshooting

### Common Issues

1. Database Connection Issues:
   - Ensure PostgreSQL is running
   - Check database credentials in .env file
   - Verify database exists: `createdb biz_manage`

2. Redis Connection Issues:
   - Ensure Redis server is running
   - Check Redis URL in .env file

3. Migration Issues:
   - Delete migrations folder and database
   - Run `flask db init` again
   - Run `flask db migrate -m "Initial migration"`
   - Run `flask db upgrade`

4. Port Conflicts:
   - Check if ports 5000 (backend) and 3000 (frontend) are available
   - Modify ports in configuration if needed

### Environment Variables

Make sure to set these environment variables in your .env file:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT secret key
- `MAIL_*`: Email configuration (if using email features)

## API Documentation

The API documentation is available at `/api/docs` when running the application.

## Security

- All API endpoints are protected with JWT authentication
- Rate limiting is implemented to prevent abuse
- CORS is configured for security
- Passwords are hashed using bcrypt
- Environment variables are used for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository.