from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.task_routes = {
    "app.core.notifications.*": {"queue": "notifications"},
    "app.core.email.*": {"queue": "emails"},
}

celery_app.conf.beat_schedule = {
    "check-low-stock-alerts": {
        "task": "app.core.notifications.check_low_stock_alerts",
        "schedule": crontab(minute="*/30"),  # Every 30 minutes
    },
    "check-out-of-stock-alerts": {
        "task": "app.core.notifications.check_out_of_stock_alerts",
        "schedule": crontab(minute="*/15"),  # Every 15 minutes
    },
}

celery_app.conf.timezone = "UTC" 