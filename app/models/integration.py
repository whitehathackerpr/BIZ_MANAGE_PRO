from app.extensions import db

class IntegrationProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    config_schema = db.Column(db.JSON)
    is_active = db.Column(db.Boolean, default=True)

class IntegrationInstance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('integration_provider.id'))
    name = db.Column(db.String(255), nullable=False)
    config = db.Column(db.JSON)
    credentials = db.Column(db.JSON)
    status = db.Column(db.String(50))
    error_message = db.Column(db.Text)
    last_sync_at = db.Column(db.DateTime)
    
    provider = db.relationship('IntegrationProvider') 