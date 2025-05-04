from app.models.user import User, UserRole
from app.core.security import verify_password

def authenticate_supplier(db, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.role == UserRole.SUPPLIER).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None

def authenticate_customer(db, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.role == UserRole.CUSTOMER).first()
    if user and verify_password(password, user.password_hash):
        return user
    return None

def authenticate_with_business(db, business_id: str, email: str, password: str):
    from app.models.business import Business
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    # Check if user is associated with the business
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        return None
    if user.role == UserRole.OWNER and business.owner_id == user.id:
        return user
    if user.role in [UserRole.BRANCH_MANAGER, UserRole.STAFF, UserRole.CASHIER]:
        # Check if user is assigned to a branch of this business
        for branch in user.assigned_branches:
            if branch.business_id == int(business_id):
                return user
    return None 