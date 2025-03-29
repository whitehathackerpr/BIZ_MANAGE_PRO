from app import create_app, db
from app.models import User, Role, Branch, Category
from werkzeug.security import generate_password_hash
from flask_migrate import upgrade

def init_db():
    app = create_app()
    with app.app_context():
        # Run any pending migrations
        upgrade()
        
        # Create all tables
        db.create_all()
        
        # Create roles if they don't exist
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = Role(name='admin', description='Administrator')
            db.session.add(admin_role)
            
        manager_role = Role.query.filter_by(name='manager').first()
        if not manager_role:
            manager_role = Role(name='manager', description='Branch Manager')
            db.session.add(manager_role)
            
        employee_role = Role.query.filter_by(name='employee').first()
        if not employee_role:
            employee_role = Role(name='employee', description='Employee')
            db.session.add(employee_role)
            
        # Create default admin user if it doesn't exist
        admin_user = User.query.filter_by(email='admin@example.com').first()
        if not admin_user:
            admin_user = User(
                email='admin@example.com',
                username='admin',
                password_hash=generate_password_hash('admin123'),
                role=admin_role,
                is_active=True
            )
            db.session.add(admin_user)
            
        # Create default branch if it doesn't exist
        default_branch = Branch.query.filter_by(name='Main Branch').first()
        if not default_branch:
            default_branch = Branch(
                name='Main Branch',
                address='123 Main St',
                phone='555-0123',
                email='main@example.com'
            )
            db.session.add(default_branch)
            
        # Create default categories if they don't exist
        default_categories = [
            'Electronics',
            'Clothing',
            'Food',
            'Beverages',
            'Household',
            'Other'
        ]
        
        for category_name in default_categories:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
                
        # Commit all changes
        db.session.commit()
        print("Database initialized successfully!")

if __name__ == '__main__':
    init_db() 