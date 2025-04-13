# 🚀 Business Management System (BIZ_MANAGE_PRO)

A modern, full-stack business management system with a Web3-inspired design, real-time features, and advanced analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109.2-green.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-14-blue.svg)
![Redis](https://img.shields.io/badge/redis-6-blue.svg)

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
- 📝 API Documentation with Swagger UI
- ⚡ High-performance with async support

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Material-UI v5
- React Query
- Socket.IO Client
- Chart.js
- React Router v6
- Axios
- date-fns

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- JWT
- WebSocket
- Pandas & NumPy
- scikit-learn
- Pydantic
- Uvicorn

### Infrastructure
- Docker
- Docker Compose
- Nginx
- Prometheus
- Grafana
- pgAdmin

## 🚀 Getting Started

### Prerequisites
- Docker
- Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BIZ_MANAGE_PRO.git
cd BIZ_MANAGE_PRO
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

3. Start the application:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- pgAdmin: http://localhost:5050
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

### Development

1. Start the backend in development mode:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

2. Start the frontend in development mode:
```bash
cd frontend
npm install
npm run dev
```

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
- Input validation with Pydantic
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

- Akandwanaho Ivan Alvin- Initial work - [YourGitHub](https://github.com/whitehathackerpr)

## 🙏 Acknowledgments

- FastAPI team for the excellent web framework
- Material-UI team for the amazing UI components
- React team for the powerful frontend library
- All contributors who have helped shape this project

## 📞 Support

For support, email support@example.com or join our Slack channel.

---

Made with ❤️ by [Akandwanaho Ivan Alvin](https://github.com/whitehathackerpr)