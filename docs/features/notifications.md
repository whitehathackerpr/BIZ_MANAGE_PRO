# Notification System

## Overview

The notification system provides real-time alerts and notifications across multiple channels. It supports email, push notifications, and SMS with configurable user preferences.

## Features

### Notification Types
- `LOW_STOCK` - Alerts for low inventory levels
- `OUT_OF_STOCK` - Alerts for out of stock items
- `ORDER_STATUS` - Order status updates
- `PAYMENT_STATUS` - Payment status changes
- `SYSTEM` - System notifications
- `TASK` - Task assignments and updates
- `ALERT` - General alerts

### Priority Levels
- `LOW` - Non-urgent information
- `MEDIUM` - Standard notifications
- `HIGH` - Important alerts
- `URGENT` - Critical notifications

### Delivery Channels
1. **Email Notifications**
   - HTML email templates
   - Customizable layouts
   - Attachment support

2. **Push Notifications**
   - Real-time delivery
   - Click actions
   - Rich media support

3. **SMS Notifications**
   - Text-based alerts
   - Priority messages
   - Opt-in/out options

## User Preferences

Users can configure their notification preferences:

```json
{
    "email_enabled": true,
    "push_enabled": true,
    "sms_enabled": false,
    "notification_types": {
        "low_stock": true,
        "out_of_stock": true,
        "order_status": true,
        "payment_status": true,
        "system": true,
        "task": true,
        "alert": true
    },
    "minimum_priority": "LOW"
}
```

## Automated Monitoring

### Stock Level Monitoring
- Checks inventory levels every 30 minutes
- Generates low stock alerts based on configured thresholds
- Creates urgent notifications for out-of-stock items

### Task Scheduling
- Celery-based background tasks
- Configurable check intervals
- Automatic retry for failed notifications

## API Endpoints

### Get Notifications
```http
GET /api/v1/notifications/
```

Query Parameters:
- `skip`: Number of records to skip
- `limit`: Number of records to return
- `status`: Filter by status (unread, read, archived)
- `type`: Filter by notification type

### Update Preferences
```http
PUT /api/v1/notifications/preferences
```

Request Body:
```json
{
    "email_enabled": true,
    "push_enabled": true,
    "sms_enabled": false,
    "notification_types": {
        "low_stock": true
    },
    "minimum_priority": "MEDIUM"
}
```

## Implementation Details

### Notification Creation
```python
notification = models.Notification(
    type=schemas.NotificationType.LOW_STOCK,
    title="Low Stock Alert",
    message="Product X is running low on stock",
    priority=schemas.NotificationPriority.HIGH,
    data={
        "product_id": 123,
        "quantity": 5
    }
)
```

### Channel Integration

1. Email Integration:
```python
@celery_app.task
def send_email_notification(user_id: int, notification_id: int):
    # Email sending logic
    pass
```

2. Push Notification:
```python
@celery_app.task
def send_push_notification(user_id: int, notification_id: int):
    # Push notification logic
    pass
```

3. SMS:
```python
@celery_app.task
def send_sms_notification(user_id: int, notification_id: int):
    # SMS sending logic
    pass
```

## Best Practices

1. **Priority Management**
   - Use appropriate priority levels
   - Don't overuse URGENT priority
   - Consider user timezone for delivery

2. **Content Guidelines**
   - Keep messages clear and concise
   - Include relevant action items
   - Provide sufficient context

3. **Performance Considerations**
   - Use background tasks for sending
   - Implement retry mechanisms
   - Monitor delivery success rates

4. **User Experience**
   - Allow easy opt-out options
   - Provide notification history
   - Support bulk actions (mark all as read) 