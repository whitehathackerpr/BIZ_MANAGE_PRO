from app import mysql
from datetime import datetime

class Employee:
    def __init__(self, id, name, position, hire_date):
        self.id = id
        self.name = name
        self.position = position
        self.hire_date = hire_date

    @staticmethod
    def create(name, position):
        cur = mysql.connection.cursor()
        cur.execute('''
            INSERT INTO employees (name, position, hire_date)
            VALUES (%s, %s, %s)
        ''', (name, position, datetime.now()))
        mysql.connection.commit()
        cur.close() 