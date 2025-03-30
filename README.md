# 🚀 Business Management System (BIZ_MANAGE_PRO)

A modern, full-stack business management system with a Web3-inspired design, real-time features, and advanced analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Features

### Frontend
- 🎨 Modern Web3-inspired UI with glassmorphism effects
- 📱 Fully responsive design
- 🔄 Real-time updates with WebSocket
- 📊 Interactive dashboards and analytics
- 🔔 Real-time notifications
- 🌙 Dark mode support
- 🌐 RTL (Right-to-Left) language support

### Backend
- 🔒 JWT-based authentication
- 📦 PostgreSQL database with SQLAlchemy ORM
- 🔄 Redis for caching and real-time features
- 📧 Email notifications
- 📊 Advanced analytics and reporting
- 🔍 Full-text search
- 📱 RESTful API with versioning
- 🔒 Rate limiting and security features

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI v5
- React Query
- Socket.IO Client
- Chart.js
- React Router v6
- Axios
- date-fns

### Backend
- Python 3.12
- Flask
- SQLAlchemy
- PostgreSQL
- Redis
- JWT
- WebSocket
- Pandas & NumPy
- scikit-learn

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Run migrations
flask db upgrade
```

3. Set up the frontend:
```bash
# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python run.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

## 📚 Documentation

### API Documentation
- [Authentication API](docs/api/auth.md)
- [User Management API](docs/api/users.md)
- [Branch Management API](docs/api/branches.md)
- [Inventory Management API](docs/api/inventory.md)
- [Analytics API](docs/api/analytics.md)

### Database Schema
- [User Model](docs/models/user.md)
- [Branch Model](docs/models/branch.md)
- [Product Model](docs/models/product.md)
- [Order Model](docs/models/order.md)
- [Customer Model](docs/models/customer.md)
- [Employee Model](docs/models/employee.md)
- [Inventory Model](docs/models/inventory.md)
- [Notification Model](docs/models/notification.md)

### Development Guide
- [Setup Guide](docs/development/setup.md)
- [Code Style Guide](docs/development/code-style.md)
- [Testing Guide](docs/development/testing.md)
- [Deployment Guide](docs/development/deployment.md)

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Analytics Features

- Real-time sales analytics
- Inventory tracking
- Customer insights
- Employee performance metrics
- Branch performance comparison
- Predictive analytics
- Custom report generation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Material-UI team for the amazing UI components
- Flask team for the excellent web framework
- React team for the powerful frontend library
- All contributors who have helped shape this project

## 📞 Support

For support, email support@example.com or join our Slack channel.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)