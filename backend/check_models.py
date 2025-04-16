import os
import re

def find_files_with_db_model():
    model_files = []
    model_dir = os.path.join('app', 'models')
    
    for root, _, files in os.walk(model_dir):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r') as f:
                    content = f.read()
                    if 'db.Model' in content:
                        model_files.append(file_path)
    
    return model_files

if __name__ == "__main__":
    files = find_files_with_db_model()
    if files:
        print("The following files still use db.Model:")
        for file in files:
            print(f"  - {file}")
    else:
        print("No files using db.Model found.")
    
    # Now try to import models 
    try:
        from app.models import User
        print("Successfully imported User model")
        # Try importing the model that caused the error
        from app.models.transaction import Transaction
        print("Successfully imported Transaction model")
    except Exception as e:
        print(f"Error importing models: {str(e)}")
        import traceback
        traceback.print_exc() 