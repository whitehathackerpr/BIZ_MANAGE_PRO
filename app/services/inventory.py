from app import db
from app.models.inventory import InventoryTransaction, PurchaseOrder, PurchaseOrderItem
from app.models.product import Product
from app.services.notification import NotificationService

class InventoryService:
    @staticmethod
    def adjust_stock(product_id, quantity, type, reference_id, notes, user_id):
        """Adjust product stock and create inventory transaction."""
        product = Product.query.get_or_404(product_id)
        
        # Update product stock
        product.stock += quantity
        
        # Create inventory transaction
        transaction = InventoryTransaction(
            product_id=product_id,
            type=type,
            quantity=quantity,
            reference_id=reference_id,
            notes=notes,
            created_by=user_id
        )
        
        db.session.add(transaction)
        
        # Check if stock is below reorder point
        if product.stock <= product.reorder_point:
            NotificationService.notify_low_stock(product)
        
        db.session.commit()
        return transaction

    @staticmethod
    def create_purchase_order(supplier_id, items, notes, user_id):
        """Create a new purchase order."""
        po = PurchaseOrder(
            supplier_id=supplier_id,
            notes=notes,
            created_by=user_id,
            status='draft'
        )
        
        total_amount = 0
        for item in items:
            po_item = PurchaseOrderItem(
                product_id=item['product_id'],
                quantity=item['quantity'],
                unit_price=item['unit_price']
            )
            po.items.append(po_item)
            total_amount += item['quantity'] * item['unit_price']
        
        po.total_amount = total_amount
        db.session.add(po)
        db.session.commit()
        
        return po

    @staticmethod
    def receive_purchase_order(po_id, received_items, user_id):
        """Process received items for a purchase order."""
        po = PurchaseOrder.query.get_or_404(po_id)
        
        for item in received_items:
            po_item = PurchaseOrderItem.query.filter_by(
                po_id=po_id,
                product_id=item['product_id']
            ).first()
            
            if not po_item:
                continue
            
            # Update received quantity
            quantity = item['quantity']
            po_item.received_quantity += quantity
            
            # Adjust product stock
            InventoryService.adjust_stock(
                product_id=item['product_id'],
                quantity=quantity,
                type='receive',
                reference_id=po.po_number,
                notes=f'Received from PO #{po.po_number}',
                user_id=user_id
            )
        
        # Update PO status if all items received
        if all(item.received_quantity >= item.quantity for item in po.items):
            po.status = 'received'
        
        db.session.commit()
        return po

    @staticmethod
    def get_stock_movements(product_id, start_date=None, end_date=None):
        """Get stock movement history for a product."""
        query = InventoryTransaction.query.filter_by(product_id=product_id)
        
        if start_date:
            query = query.filter(InventoryTransaction.created_at >= start_date)
        if end_date:
            query = query.filter(InventoryTransaction.created_at <= end_date)
        
        return query.order_by(InventoryTransaction.created_at.desc()).all() 