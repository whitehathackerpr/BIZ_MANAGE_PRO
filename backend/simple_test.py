print("Starting test...")

try:
    # Import the transaction model directly
    from app.models.transaction import Transaction, TransactionCategory
    print("Successfully imported Transaction models")
    
    # Import notification models
    from app.models.notification import Notification, NotificationSetting
    print("Successfully imported Notification models")
    
    # Import all models from __init__
    from app.models import User, Role, Transaction, Sale
    print("Successfully imported all models from __init__")
    
    print("All imports successful!")
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc() 