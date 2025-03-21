import os
from dotenv import load_dotenv
from app import create_app
from config import config

# Load environment variables
load_dotenv()

# Get environment configuration
env = os.environ.get('FLASK_ENV', 'development')
app = create_app(config[env])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=(env == 'development')) 