from pathlib import Path

NOTIFICATION_FILE = Path('app/models/notification.py')

def fix_notification_model():
    if not NOTIFICATION_FILE.exists():
        print(f"File {NOTIFICATION_FILE} does not exist.")
        return
    
    content = NOTIFICATION_FILE.read_text()
    
    # Check if it's using db.Model
    if 'db.Model' not in content:
        print(f"File {NOTIFICATION_FILE} is already fixed.")
        return
    
    # Replace the imports
    content = content.replace(
        'from ..extensions import db',
        'from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey\nfrom sqlalchemy.orm import relationship\nfrom ..extensions import Base'
    )
    
    # Replace db.Model with Base
    content = content.replace('class Notification(db.Model)', 'class Notification(Base)')
    content = content.replace('class NotificationSetting(db.Model)', 'class NotificationSetting(Base)')
    
    # Replace column and relationship references
    content = content.replace('db.Column', 'Column')
    content = content.replace('db.Integer', 'Integer')
    content = content.replace('db.String', 'String')
    content = content.replace('db.Text', 'Text')
    content = content.replace('db.Boolean', 'Boolean')
    content = content.replace('db.DateTime', 'DateTime')
    content = content.replace('db.ForeignKey', 'ForeignKey')
    content = content.replace('db.relationship', 'relationship')
    
    # Write the fixed content back
    NOTIFICATION_FILE.write_text(content)
    print(f"Successfully fixed {NOTIFICATION_FILE}")

if __name__ == '__main__':
    fix_notification_model() 