from app import mysql
from datetime import datetime

class Transaction:
    def __init__(self, id, type, amount, description, date):
        self.id = id
        self.type = type  # 'income' or 'expense'
        self.amount = amount
        self.description = description
        self.date = date

    @staticmethod
    def create(type, amount, description):
        cur = mysql.connection.cursor()
        cur.execute('''
            INSERT INTO transactions (type, amount, description, date)
            VALUES (%s, %s, %s, %s)
        ''', (type, amount, description, datetime.now()))
        mysql.connection.commit()
        transaction_id = cur.lastrowid
        cur.close()
        return Transaction.get_by_id(transaction_id)

    @staticmethod
    def get_balance():
        cur = mysql.connection.cursor()
        cur.execute('''
            SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) 
            FROM transactions
        ''')
        balance = cur.fetchone()[0] or 0
        cur.close()
        return float(balance) 