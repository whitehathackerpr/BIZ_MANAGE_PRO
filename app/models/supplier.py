from app import mysql
from datetime import datetime

class Supplier:
    def __init__(self, id, name, contact, email, phone):
        self.id = id
        self.name = name
        self.contact = contact
        self.email = email
        self.phone = phone

    @staticmethod
    def create(name, contact, email, phone):
        cur = mysql.connection.cursor()
        cur.execute('''
            INSERT INTO suppliers (name, contact, email, phone)
            VALUES (%s, %s, %s, %s)
        ''', (name, contact, email, phone))
        mysql.connection.commit()
        supplier_id = cur.lastrowid
        cur.close()
        return Supplier.get_by_id(supplier_id)

    @staticmethod
    def get_by_id(supplier_id):
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM suppliers WHERE id = %s', (supplier_id,))
        supplier_data = cur.fetchone()
        cur.close()
        if supplier_data:
            return Supplier(*supplier_data)
        return None 