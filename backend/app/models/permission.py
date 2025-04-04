from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Permission(Base):
    __tablename__ = "permission"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    # Relationships
    roles = relationship("Role", secondary="role_permission", back_populates="permissions")

    def to_dict(self):
        """Convert permission to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        } 