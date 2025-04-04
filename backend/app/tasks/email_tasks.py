from ..celery_app import celery
from flask_mail import Message
from ..extensions import mail
from flask import current_app

@celery.task(bind=True, max_retries=3)
def send_email(self, subject, recipients, body, html=None):
    """Send an email using Flask-Mail"""
    try:
        msg = Message(
            subject=subject,
            recipients=recipients,
            body=body,
            html=html
        )
        mail.send(msg)
        return True
    except Exception as exc:
        self.retry(exc=exc, countdown=60)  # Retry after 60 seconds

@celery.task(bind=True, max_retries=3)
def send_bulk_emails(self, email_list):
    """Send bulk emails"""
    results = []
    for email_data in email_list:
        try:
            result = send_email.delay(
                subject=email_data['subject'],
                recipients=email_data['recipients'],
                body=email_data['body'],
                html=email_data.get('html')
            )
            results.append({
                'email': email_data['recipients'],
                'status': 'queued',
                'task_id': result.id
            })
        except Exception as e:
            results.append({
                'email': email_data['recipients'],
                'status': 'failed',
                'error': str(e)
            })
    return results 