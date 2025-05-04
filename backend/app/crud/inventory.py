from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime
from ..models.inventory import Inventory, StockMovement, BranchInventory, InventoryTransaction
from ..schemas.inventory import InventoryCreate, InventoryUpdate, StockMovementCreate, InventoryTransactionCreate, InventoryTransactionUpdate

class InventoryCRUD:
    def get(self, db: Session, id: int) -> Optional[Inventory]:
        """Get inventory by id"""
        return db.query(Inventory).filter(Inventory.id == id).first()
    
    def get_by_branch_product(self, db: Session, branch_id: int, product_id: int) -> Optional[Inventory]:
        """Get inventory by branch and product"""
        return db.query(Inventory).filter(
            and_(
                Inventory.branch_id == branch_id,
                Inventory.product_id == product_id
            )
        ).first()
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        branch_id: Optional[int] = None,
        low_stock: Optional[bool] = None
    ) -> List[Inventory]:
        """Get multiple inventory items with optional filters"""
        query = db.query(Inventory)
        
        if branch_id:
            query = query.filter(Inventory.branch_id == branch_id)
            
        if low_stock:
            query = query.filter(Inventory.quantity <= Inventory.reorder_point)
            
        return query.offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: InventoryCreate) -> Inventory:
        """Create new inventory item"""
        db_obj = Inventory(
            branch_id=obj_in.branch_id,
            product_id=obj_in.product_id,
            quantity=obj_in.quantity,
            minimum_stock=obj_in.minimum_stock,
            maximum_stock=obj_in.maximum_stock,
            reorder_point=obj_in.reorder_point,
            reorder_quantity=obj_in.reorder_quantity,
            location=obj_in.location,
            batch_number=obj_in.batch_number,
            expiry_date=obj_in.expiry_date
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Inventory, 
        obj_in: Union[InventoryUpdate, Dict[str, Any]]
    ) -> Inventory:
        """Update inventory item"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def adjust_quantity(
        self,
        db: Session,
        *,
        inventory_id: int,
        quantity_change: int,
        movement_type: str,
        reference: Optional[str] = None,
        notes: Optional[str] = None,
        created_by: int
    ) -> Inventory:
        """Adjust inventory quantity and log movement"""
        inventory = self.get(db, id=inventory_id)
        if not inventory:
            return None
            
        # Update quantity
        inventory.quantity += quantity_change
        
        # Create stock movement
        stock_movement = StockMovement(
            inventory_id=inventory_id,
            quantity=abs(quantity_change),
            movement_type=movement_type,
            reference=reference,
            notes=notes,
            created_by=created_by
        )
        db.add(stock_movement)
        
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
        return inventory
    
    def create_stock_movement(
        self,
        db: Session,
        *,
        obj_in: StockMovementCreate,
        created_by: int
    ) -> StockMovement:
        """Create stock movement"""
        db_obj = StockMovement(
            inventory_id=obj_in.inventory_id,
            quantity=obj_in.quantity,
            movement_type=obj_in.movement_type,
            reference=obj_in.reference,
            notes=obj_in.notes,
            created_by=created_by
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_branch_inventory(
        self,
        db: Session,
        *,
        branch_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[BranchInventory]:
        """Get inventory for a branch"""
        return db.query(BranchInventory).filter(
            BranchInventory.branch_id == branch_id
        ).offset(skip).limit(limit).all()
    
    def create_inventory_transaction(
        self,
        db: Session,
        *,
        obj_in: InventoryTransactionCreate,
        created_by: int
    ) -> InventoryTransaction:
        """Create inventory transaction"""
        db_obj = InventoryTransaction(
            branch_id=obj_in.branch_id,
            product_id=obj_in.product_id,
            quantity=obj_in.quantity,
            transaction_type=obj_in.transaction_type,
            reference_id=obj_in.reference_id,
            reference_type=obj_in.reference_type,
            notes=obj_in.notes,
            created_by=created_by
        )
        db.add(db_obj)
        
        # Update branch inventory
        inventory = self.get_by_branch_product(db, branch_id=obj_in.branch_id, product_id=obj_in.product_id)
        if inventory:
            if obj_in.transaction_type in ["purchase", "return"]:
                inventory.quantity += obj_in.quantity
            elif obj_in.transaction_type in ["sale", "waste"]:
                inventory.quantity -= obj_in.quantity
            
            db.add(inventory)
            
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_inventory_transactions(
        self,
        db: Session,
        *,
        branch_id: Optional[int] = None,
        product_id: Optional[int] = None,
        transaction_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[InventoryTransaction]:
        """Get inventory transactions with filters"""
        query = db.query(InventoryTransaction)
        
        if branch_id:
            query = query.filter(InventoryTransaction.branch_id == branch_id)
            
        if product_id:
            query = query.filter(InventoryTransaction.product_id == product_id)
            
        if transaction_type:
            query = query.filter(InventoryTransaction.transaction_type == transaction_type)
            
        return query.order_by(desc(InventoryTransaction.created_at)).offset(skip).limit(limit).all()

# Create an instance
inventory_crud = InventoryCRUD() 