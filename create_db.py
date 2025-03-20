from app import create_app, db
from app.models.user import User
from app.models.order import Order

app = create_app()

def init_db():
    with app.app_context():
        # Drop all tables first (optional, remove if you want to keep existing data)
        db.drop_all()
        print("Dropped all tables successfully!")
        
        # Create all tables
        db.create_all()
        print("Created all tables successfully!")

if __name__ == "__main__":
    init_db() 