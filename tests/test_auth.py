import unittest
from app import create_app, mysql
from app.models.user import User
from config import Config

class TestConfig(Config):
    TESTING = True
    MYSQL_DB = 'bizmanage_pro_test'

class AuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Set up test database
        cur = mysql.connection.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(120) UNIQUE NOT NULL,
                name VARCHAR(120) NOT NULL,
                password_hash VARCHAR(128) NOT NULL
            )
        ''')
        mysql.connection.commit()
        cur.close()

    def tearDown(self):
        # Clean up test database
        cur = mysql.connection.cursor()
        cur.execute('DROP TABLE users')
        mysql.connection.commit()
        cur.close()
        self.app_context.pop()

    def test_register(self):
        # Test user registration
        response = self.client.post('/auth/register', data={
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'test123',
            'password2': 'test123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful registration

    def test_login(self):
        # Create test user
        response = self.client.post('/auth/register', data={
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'test123',
            'password2': 'test123'
        })

        # Test login
        response = self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'test123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful login

    def test_logout(self):
        # Login first
        self.client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'test123'
        })

        # Test logout
        response = self.client.get('/auth/logout')
        self.assertEqual(response.status_code, 302)  # Redirect after logout 