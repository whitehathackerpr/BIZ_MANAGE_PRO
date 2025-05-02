from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from ..extensions import Base

class AnalyticsEvent(Base):
    __tablename__ = 'analytics_events'
    id = Column(Integer, primary_key=True)
    event_type = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    branch_id = Column(Integer, ForeignKey('branches.id'))
    data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', backref='analytics_events')
    branch = relationship('Branch', backref='analytics_events')
    def __repr__(self):
        return f'<AnalyticsEvent {self.event_type}>'

class AnalyticsMetric(Base):
    __tablename__ = 'analytics_metrics'
    id = Column(Integer, primary_key=True)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    branch_id = Column(Integer, ForeignKey('branches.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship('Branch', backref='analytics_metrics')
    def __repr__(self):
        return f'<AnalyticsMetric {self.metric_name}>'

class AnalyticsReport(Base):
    __tablename__ = 'analytics_reports'
    id = Column(Integer, primary_key=True)
    report_type = Column(String(100), nullable=False)
    branch_id = Column(Integer, ForeignKey('branches.id'))
    data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship('Branch', backref='analytics_reports')
    def __repr__(self):
        return f'<AnalyticsReport {self.report_type}>'

class BranchAnalytics(Base):
    __tablename__ = 'branch_analytics'
    id = Column(Integer, primary_key=True)
    branch_id = Column(Integer, ForeignKey('branches.id'), nullable=False)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    branch = relationship('Branch', backref='branch_analytics')
    reports = relationship('BranchAnalyticsReport', back_populates='analytics')
    def __repr__(self):
        return f'<BranchAnalytics {self.id}>'

class BranchAnalyticsReport(Base):
    __tablename__ = 'branch_analytics_reports'
    id = Column(Integer, primary_key=True)
    analytics_id = Column(Integer, ForeignKey('branch_analytics.id'), nullable=False)
    report_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    analytics = relationship('BranchAnalytics', back_populates='reports')
    def __repr__(self):
        return f'<BranchAnalyticsReport {self.id}>' 