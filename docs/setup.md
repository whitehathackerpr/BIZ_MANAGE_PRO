# BizManage Pro Setup Guide

## Prerequisites

- Python 3.8 or higher
- MySQL 8.0 or higher
- Node.js 14.0 or higher (for building assets)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bizmanage-pro.git
cd bizmanage-pro
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with the following:
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DB=bizmanage_pro
```

5. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

6. Run the application:
```bash
flask run
```

## Development

### Code Structure

- `app/`: Main application package
  - `auth/`: Authentication related files
  - `main/`: Main routes and views
  - `models/`: Database models
  - `static/`: Static files (CSS, JS, images)
  - `templates/`: HTML templates

### Running Tests

```bash
pytest
```

### Building Assets

```bash
npm install
npm run build
```

## Deployment

1. Set up production server (e.g., Ubuntu with Nginx)
2. Install requirements
3. Configure Nginx
4. Set up SSL certificate
5. Configure environment variables
6. Run with gunicorn

## Troubleshooting

Common issues and solutions...