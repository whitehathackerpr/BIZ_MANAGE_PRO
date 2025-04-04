from datetime import datetime
from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.orm import Session
from fastapi import Depends
from ..database import get_db

@as_declarative()
class Base:
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    def to_dict(self) -> dict:
        return {
            column.name: getattr(this, column.name)
            for column in self.__table__.columns
        }

    @classmethod
    def get_db(cls) -> Session:
        return next(get_db()) 