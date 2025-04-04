from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate

class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.name == name).first()

    def create(self, db: Session, *, obj_in: RoleCreate) -> Role:
        db_obj = Role(
            name=obj_in.name,
            description=obj_in.description,
        )
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
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def add_permission(self, db: Session, *, role: Role, permission_id: int) -> Role:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise ValueError("Permission not found")
        role.permissions.append(permission)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    def remove_permission(self, db: Session, *, role: Role, permission_id: int) -> Role:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise ValueError("Permission not found")
        role.permissions.remove(permission)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

role = CRUDRole(Role) 