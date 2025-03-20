from app import mysql
from datetime import datetime
import json

from app.models.product import Product

class Sale:
    def __init__(self, id, user_id, items, total, date):
        self.id = id
        self.user_id = user_id
        self.items = json.loads(items) if isinstance(items, str) else items
        self.total = total
        self.date = date

    @staticmethod
    def create(user_id, items, total):
        cur = mysql.connection.cursor()
        cur.execute('''
            INSERT INTO sales (user_id, items, total, date)
            VALUES (%s, %s, %s, %s)
        ''', (user_id, json.dumps(items), total, datetime.now()))
        mysql.connection.commit()
        sale_id = cur.lastrowid
        cur.close()

        # Update product stock
        for item in items:
            Product.update_stock(item['product_id'], -item['quantity'])

        return Sale.get_by_id(sale_id)

    @staticmethod
    def get_daily_stats():
        cur = mysql.connection.cursor()
        cur.execute('''
            SELECT DATE(date) as sale_date, SUM(total) as daily_total
            FROM sales
            GROUP BY DATE(date)
            ORDER BY sale_date DESC
            LIMIT 30
        ''')
        stats = cur.fetchall()
        cur.close()
        return [{'date': str(stat[0]), 'total': float(stat[1])} for stat in stats] 