from app import create_app, socketio, db
from flask_migrate import Migrate, upgrade
import os

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': app.models.User,
        'Product': app.models.Product,
        'Sale': app.models.Sale,
        'Inventory': app.models.Inventory,
        'Branch': app.models.Branch,
        'Employee': app.models.Employee,
        'Customer': app.models.Customer,
        'Supplier': app.models.Supplier,
        'Purchase': app.models.Purchase,
        'Category': app.models.Category,
        'Analytics': app.models.Analytics
    }

@app.cli.command()
def deploy():
    """Run deployment tasks."""
    try:
        # Run database migrations
        upgrade()
        
        # Create tables if they don't exist
        db.create_all()
        
        print("Deployment completed successfully!")
    except Exception as e:
        print(f"Error during deployment: {str(e)}")
        raise

if __name__ == '__main__':
    # Ensure the upload folder exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # Run the application
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=True
    ) 