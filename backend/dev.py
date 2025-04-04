import uvicorn
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Set development environment variables
    os.environ['APP_ENV'] = 'development'
    os.environ['DEBUG'] = '1'
    
    # Run the application with uvicorn in development mode
    uvicorn.run(
        "dev:app",
        host='0.0.0.0',
        port=5000,
        reload=True,
        debug=True,
        log_level="debug"
    ) 