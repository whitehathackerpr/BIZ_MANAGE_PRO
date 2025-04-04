import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from prometheus_client import Counter, Histogram, start_http_server
from flask import request, g
import time

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

def init_monitoring(app):
    """Initialize monitoring tools"""
    # Initialize Sentry
    sentry_sdk.init(
        dsn=app.config.get('SENTRY_DSN'),
        integrations=[FlaskIntegration()],
        traces_sample_rate=1.0,
        environment=app.config.get('FLASK_ENV', 'development')
    )
    
    # Start Prometheus metrics server
    start_http_server(9090)
    
    # Add request monitoring middleware
    @app.before_request
    def before_request():
        g.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=request.endpoint
            ).observe(duration)
            
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.endpoint,
                status=response.status_code
            ).inc()
        
        return response
    
    # Add health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    # Add metrics endpoint
    @app.route('/metrics')
    def metrics():
        from prometheus_client import generate_latest
        return generate_latest(), 200, {'Content-Type': 'text/plain'} 