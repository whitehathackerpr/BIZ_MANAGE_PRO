from typing import Optional, Dict, Any
from fastapi import Request
from sqlalchemy.orm import Session
from ..models.audit_log import AuditLog
from ..core.logging import logger

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log_event(
        self,
        action: str,
        resource: str,
        user_id: Optional[int] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None,
    ) -> None:
        """
        Log a security event.
        """
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource=resource,
                resource_id=resource_id,
                details=details,
                ip_address=request.client.host if request else None,
                user_agent=request.headers.get("user-agent") if request else None,
            )
            self.db.add(audit_log)
            self.db.commit()
            logger.info(f"Audit log created: {action} on {resource}")
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            self.db.rollback()

    def get_user_logs(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list[AuditLog]:
        """
        Get audit logs for a user.
        """
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        ) 