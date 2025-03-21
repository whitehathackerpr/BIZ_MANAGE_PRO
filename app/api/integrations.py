from flask_restx import Namespace, Resource, fields
from flask import request
from app.models.integration import IntegrationInstance, IntegrationProvider
from app.utils.auth import require_auth
from app.utils.integrations import get_integration_handler

api = Namespace('integrations', description='Integration operations')

# Models
integration_config_model = api.model('IntegrationConfig', {
    'provider_id': fields.Integer(required=True),
    'name': fields.String(required=True),
    'config': fields.Raw(required=True),
    'credentials': fields.Raw(required=True)
})

integration_status_model = api.model('IntegrationStatus', {
    'id': fields.Integer,
    'name': fields.String,
    'status': fields.String,
    'last_sync_at': fields.DateTime,
    'error_message': fields.String
})

@api.route('/providers')
class IntegrationProviderList(Resource):
    @api.doc('list_integration_providers', security='apikey')
    @require_auth
    def get(self):
        """List available integration providers"""
        providers = IntegrationProvider.query.filter_by(is_active=True).all()
        return [{
            'id': p.id,
            'name': p.name,
            'type': p.type,
            'description': p.description,
            'config_schema': p.config_schema
        } for p in providers]

@api.route('/instances')
class IntegrationInstanceList(Resource):
    @api.doc('create_integration', security='apikey')
    @api.expect(integration_config_model)
    @require_auth
    def post(self):
        """Create a new integration instance"""
        data = request.get_json()
        
        # Validate provider
        provider = IntegrationProvider.query.get_or_404(data['provider_id'])
        
        # Create instance
        instance = IntegrationInstance(
            provider_id=provider.id,
            name=data['name'],
            config=data['config'],
            credentials=data['credentials'],
            status='active'
        )
        instance.save()

        # Initialize integration
        handler = get_integration_handler(provider.type)
        try:
            handler.initialize(instance)
        except Exception as e:
            instance.status = 'error'
            instance.error_message = str(e)
            instance.save()
            return {'message': f'Integration initialization failed: {str(e)}'}, 400

        return {
            'id': instance.id,
            'name': instance.name,
            'status': instance.status
        }, 201

@api.route('/instances/<int:id>/sync')
class IntegrationSync(Resource):
    @api.doc('sync_integration', security='apikey')
    @require_auth
    def post(self, id):
        """Trigger integration sync"""
        instance = IntegrationInstance.query.get_or_404(id)
        handler = get_integration_handler(instance.provider.type)

        try:
            sync_result = handler.sync(instance)
            return {
                'message': 'Sync completed successfully',
                'details': sync_result
            }
        except Exception as e:
            return {'message': f'Sync failed: {str(e)}'}, 400 