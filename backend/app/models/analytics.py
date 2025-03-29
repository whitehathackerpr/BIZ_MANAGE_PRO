from datetime import datetime
from ..extensions import db

class AnalyticsEvent(db.Model):
    """Model for tracking user events in the system."""
    __tablename__ = 'analytics_events'

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)
    event_data = db.Column(db.JSON, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('events', lazy=True))

    def __init__(self, event_type, event_data=None, user_id=None):
        self.event_type = event_type
        self.event_data = event_data
        self.user_id = user_id

    def to_dict(self):
        """Convert the event to a dictionary."""
        return {
            'id': self.id,
            'event_type': self.event_type,
            'event_data': self.event_data,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def create_event(cls, event_type, event_data=None, user_id=None):
        """Create a new analytics event."""
        event = cls(
            event_type=event_type,
            event_data=event_data,
            user_id=user_id
        )
        db.session.add(event)
        db.session.commit()
        return event

    @classmethod
    def get_events_by_type(cls, event_type, start_date=None, end_date=None):
        """Get events of a specific type within a date range."""
        query = cls.query.filter_by(event_type=event_type)
        if start_date:
            query = query.filter(cls.created_at >= start_date)
        if end_date:
            query = query.filter(cls.created_at <= end_date)
        return query.order_by(cls.created_at.desc()).all()

    def __repr__(self):
        return f'<AnalyticsEvent {self.event_type} by user {self.user_id}>'

class AnalyticsMetric(db.Model):
    """Model for storing custom metrics."""
    __tablename__ = 'analytics_metrics'

    id = db.Column(db.Integer, primary_key=True)
    metric_type = db.Column(db.String(50), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    metric_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __init__(self, metric_type, metric_value, metric_date=None):
        self.metric_type = metric_type
        self.metric_value = metric_value
        self.metric_date = metric_date or datetime.utcnow().date()

    def to_dict(self):
        """Convert the metric to a dictionary."""
        return {
            'id': self.id,
            'metric_type': self.metric_type,
            'metric_value': self.metric_value,
            'metric_date': self.metric_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def create_metric(cls, metric_type, metric_value, metric_date=None):
        """Create a new analytics metric."""
        metric = cls(
            metric_type=metric_type,
            metric_value=metric_value,
            metric_date=metric_date
        )
        db.session.add(metric)
        db.session.commit()
        return metric

    @classmethod
    def get_metrics_by_type(cls, metric_type, start_date=None, end_date=None):
        """Get metrics of a specific type within a date range."""
        query = cls.query.filter_by(metric_type=metric_type)
        if start_date:
            query = query.filter(cls.metric_date >= start_date)
        if end_date:
            query = query.filter(cls.metric_date <= end_date)
        return query.order_by(cls.metric_date.desc()).all()

    def __repr__(self):
        return f'<AnalyticsMetric {self.metric_type}: {self.metric_value}>'

class AnalyticsReport(db.Model):
    """Model for storing generated analytics reports."""
    __tablename__ = 'analytics_reports'

    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.String(50), nullable=False)
    report_data = db.Column(db.JSON, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', backref=db.backref('reports', lazy=True))

    def __init__(self, report_type, report_data, start_date, end_date, created_by):
        self.report_type = report_type
        self.report_data = report_data
        self.start_date = start_date
        self.end_date = end_date
        self.created_by = created_by

    def to_dict(self):
        """Convert the report to a dictionary."""
        return {
            'id': self.id,
            'report_type': self.report_type,
            'report_data': self.report_data,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def create_report(cls, report_type, report_data, start_date, end_date, created_by):
        """Create a new analytics report."""
        report = cls(
            report_type=report_type,
            report_data=report_data,
            start_date=start_date,
            end_date=end_date,
            created_by=created_by
        )
        db.session.add(report)
        db.session.commit()
        return report

    @classmethod
    def get_reports_by_type(cls, report_type, user_id):
        """Get all reports of a specific type for a user."""
        return cls.query.filter_by(
            report_type=report_type,
            created_by=user_id
        ).order_by(cls.created_at.desc()).all()

    def __repr__(self):
        return f'<AnalyticsReport {self.report_type} by user {self.created_by}>'

class BranchAnalytics(db.Model):
    __tablename__ = 'branch_analytics'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    total_revenue = db.Column(db.Float, default=0.0)
    total_sales = db.Column(db.Integer, default=0)
    average_order_value = db.Column(db.Float, default=0.0)
    total_customers = db.Column(db.Integer, default=0)
    new_customers = db.Column(db.Integer, default=0)
    returning_customers = db.Column(db.Integer, default=0)
    total_products_sold = db.Column(db.Integer, default=0)
    top_products = db.Column(db.JSON)  # List of top selling products
    customer_retention_rate = db.Column(db.Float, default=0.0)
    inventory_turnover_rate = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='analytics')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'date': self.date.isoformat(),
            'total_revenue': self.total_revenue,
            'total_sales': self.total_sales,
            'average_order_value': self.average_order_value,
            'total_customers': self.total_customers,
            'new_customers': self.new_customers,
            'returning_customers': self.returning_customers,
            'total_products_sold': self.total_products_sold,
            'top_products': self.top_products,
            'customer_retention_rate': self.customer_retention_rate,
            'inventory_turnover_rate': self.inventory_turnover_rate,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAnalytics {self.branch.name} - {self.date}>'

class BranchAnalyticsReport(db.Model):
    __tablename__ = 'branch_analytics_reports'

    id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)  # daily, weekly, monthly, yearly
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    report_data = db.Column(db.JSON, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = db.relationship('Branch', backref='analytics_reports')
    creator = db.relationship('User', backref='created_analytics_reports')

    def to_dict(self):
        return {
            'id': self.id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.name,
            'report_type': self.report_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'report_data': self.report_data,
            'created_by': self.created_by,
            'creator_name': self.creator.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<BranchAnalyticsReport {self.branch.name} - {self.report_type}>' 