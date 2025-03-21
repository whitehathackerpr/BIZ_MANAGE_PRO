"""
Authentication API documentation
"""

login_desc = """
Authenticate a user and receive an access token.

Request body should contain:
* email: User's email address
* password: User's password

Returns:
* token: JWT access token
* user: User information
"""

register_desc = """
Register a new user account.

Request body should contain:
* name: User's full name
* email: User's email address
* password: User's password

Returns:
* message: Success message
* user: Created user information
"""

auth_responses = {
    200: 'Success',
    401: 'Invalid credentials',
    422: 'Validation error'
}

auth_fields = {
    'email': 'User email address',
    'password': 'User password',
    'name': 'User full name'
} 