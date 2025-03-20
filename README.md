# BizManage Pro

A comprehensive business management system built with Flask.

## Features

- Inventory Management
- Sales Tracking
- Employee Management
- Analytics & Reporting
- Barcode Scanning
- Invoice Generation

## Setup

1. Clone the repository: 
```bash
git clone https://github.com/yourusername/bizmanage-pro.git
cd bizmanage-pro
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables in .env file

5. Initialize database:
```bash
flask db init
flask db migrate
flask db upgrade
```

6. Run the application:
```bash
python run.py
```

## Testing

Run tests using pytest:
```bash
pytest
```

## License

MIT License