print("Testing imports...")

try:
    # Import individual models that have been fixed
    from app.models.transaction import Transaction
    print("✓ Imported Transaction")
    
    from app.models.notification import Notification
    print("✓ Imported Notification")
    
    from app.models.settings import Business, SystemSetting
    print("✓ Imported Business and SystemSetting")
    
    # Now try importing from __init__
    from app.models import (
        User, Role, Branch, Product, Category, 
        Order, OrderItem, Payment, Sale, SaleItem, 
        Supplier, Address, Employee, 
        IntegrationProvider, IntegrationInstance, IntegrationLog,
        Transaction, TransactionCategory,
        Business, SystemSetting, Notification
    )
    print("✓ Successfully imported all models from __init__")
    
    print("\n✓ All imports successful! The models have been fixed.")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc() 