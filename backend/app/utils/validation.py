def validate_role_data(data, partial=False):
    """
    Validate role data.
    
    Args:
        data (dict): Role data to validate
        partial (bool): Whether this is a partial update
        
    Returns:
        list: List of validation errors, empty if valid
    """
    errors = []
    
    if not partial:
        # Required fields for creation
        if not data.get('name'):
            errors.append('Name is required')
        elif len(data['name']) < 3:
            errors.append('Name must be at least 3 characters long')
        elif len(data['name']) > 50:
            errors.append('Name must not exceed 50 characters')
    
    # Optional fields
    if 'description' in data and len(data['description']) > 200:
        errors.append('Description must not exceed 200 characters')
    
    if 'permission_ids' in data:
        if not isinstance(data['permission_ids'], list):
            errors.append('Permission IDs must be a list')
        elif not all(isinstance(id, int) for id in data['permission_ids']):
            errors.append('All permission IDs must be integers')
    
    return errors

def validate_user_data(data, partial=False):
    """
    Stub for user data validation. Returns no errors.
    """
    return []

def validate_product_data(data, partial=False):
    """
    Stub for product data validation. Returns no errors.
    """
    return []

def validate_sale_data(data, partial=False):
    """
    Stub for sale data validation. Returns no errors.
    """
    return []

def validate_inventory_data(data, partial=False):
    """
    Stub for inventory data validation. Returns no errors.
    """
    return [] 