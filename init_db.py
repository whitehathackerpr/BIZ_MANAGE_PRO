import mysql.connector
from config import Config

def init_database():
    # Connect to MySQL without selecting a database
    conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD
    )
    
    cursor = conn.cursor()
    
    try:
        # Create main database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
        print(f"Database '{Config.MYSQL_DB}' created successfully!")
        
        # Create test database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS bizmanage_pro_test")
        print("Test database 'bizmanage_pro_test' created successfully!")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    init_database() 