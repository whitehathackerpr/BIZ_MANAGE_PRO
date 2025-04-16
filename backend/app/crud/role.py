from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.role import Role, Permission
from app.schemas.role import RoleCreate, RoleUpdate, PermissionCreate

class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.name == name).first()

    def create(self, db: Session, *, obj_in: RoleCreate) -> Role:
        db_obj = Role(
            name=obj_in.name,
            description=obj_in.description,
        )
        if obj_in.parent_role_ids:
            parent_roles = db.query(Role).filter(Role.id.in_(obj_in.parent_role_ids)).all()
            db_obj.parent_roles = parent_roles
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Role, obj_in: Union[RoleUpdate, Dict[str, Any]]
    ) -> Role:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        if "parent_role_ids" in update_data:
            parent_roles = db.query(Role).filter(Role.id.in_(update_data["parent_role_ids"])).all()
            db_obj.parent_roles = parent_roles
            del update_data["parent_role_ids"]
            
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def add_permission(self, db: Session, *, role: Role, permission: Permission) -> Role:
        if permission not in role.permissions:
            role.permissions.append(permission)
            db.add(role)
            db.commit()
            db.refresh(role)
        return role

    def remove_permission(self, db: Session, *, role: Role, permission: Permission) -> Role:
        if permission in role.permissions:
            role.permissions.remove(permission)
            db.add(role)
            db.commit()
            db.refresh(role)
        return role

    def add_parent_role(self, db: Session, *, role: Role, parent_role: Role) -> Role:
        if parent_role not in role.parent_roles:
            role.parent_roles.append(parent_role)
            db.add(role)
            db.commit()
            db.refresh(role)
        return role

    def remove_parent_role(self, db: Session, *, role: Role, parent_role: Role) -> Role:
        if parent_role in role.parent_roles:
            role.parent_roles.remove(parent_role)
            db.add(role)
            db.commit()
            db.refresh(role)
        return role

    def get_all_permissions(self, db: Session, *, role: Role) -> List[str]:
        return list(role.get_all_permissions())

def get_role(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()

def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    return db.query(Role).filter(Role.name == name).first()

def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.query(Role).offset(skip).limit(limit).all()

def create_role(db: Session, role_in: RoleCreate) -> Role:
    db_role = Role(
        name=role_in.name,
        description=role_in.description,
    )
    if role_in.parent_role_ids:
        parent_roles = db.query(Role).filter(Role.id.in_(role_in.parent_role_ids)).all()
        db_role.parent_roles = parent_roles
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, *, role: Role, role_in: RoleUpdate) -> Role:
    update_data = role_in.dict(exclude_unset=True)
    
    if "parent_role_ids" in update_data:
        parent_roles = db.query(Role).filter(Role.id.in_(update_data["parent_role_ids"])).all()
        role.parent_roles = parent_roles
        del update_data["parent_role_ids"]
    
    for field, value in update_data.items():
        setattr(role, field, value)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def delete_role(db: Session, *, role: Role) -> Role:
    db.delete(role)
    db.commit()
    return role

def get_permission(db: Session, permission_id: int) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.id == permission_id).first()

def get_permission_by_name(db: Session, name: str) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.name == name).first()

def get_permissions(db: Session, skip: int = 0, limit: int = 100) -> List[Permission]:
    return db.query(Permission).offset(skip).limit(limit).all()

def create_permission(db: Session, permission_in: PermissionCreate) -> Permission:
    db_permission = Permission(
        name=permission_in.name,
        description=permission_in.description,
        category=permission_in.category
    )
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def assign_permission(db: Session, *, role: Role, permission: Permission) -> Role:
    if permission not in role.permissions:
        role.permissions.append(permission)
        db.add(role)
        db.commit()
        db.refresh(role)
    return role

def remove_permission(db: Session, *, role: Role, permission: Permission) -> Role:
    if permission in role.permissions:
        role.permissions.remove(permission)
        db.add(role)
        db.commit()
        db.refresh(role)
    return role

role = CRUDRole(Role) 