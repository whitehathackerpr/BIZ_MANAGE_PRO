# Import all the models here to ensure they are registered with SQLAlchemy
from app.db.base_class import Base
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.models.branch import Branch
from app.models.product import Product
from app.models.employee import Employee
from app.models.sale import Sale
from app.models.customer import Customer
from app.models.inventory import Inventory, StockMovement, BranchInventory, InventoryTransfer
from app.models.transaction import Transaction
from app.models.notification import Notification, NotificationSetting, BranchNotification, BranchNotificationRecipient
from app.models.order import Order
from app.models.supplier import Supplier
from app.models.address import Address
from app.models.business import Business
from app.models.settings import SystemSetting, BranchSettings, BranchUserSettings
from app.models.integration import IntegrationProvider, IntegrationInstance, IntegrationLog, BranchIntegration, BranchIntegrationLog, BranchIntegrationMapping
from app.models.task import BranchTask, BranchTaskComment, BranchTaskChecklist
from app.models.workflow import BranchWorkflow, BranchWorkflowStep, BranchWorkflowInstance
from app.models.analytics import AnalyticsEvent, AnalyticsMetric, AnalyticsReport, BranchAnalytics, BranchAnalyticsReport
from app.models.audit import BranchAudit, BranchAuditConfig, BranchAuditExport
from app.models.document import BranchDocument, BranchDocumentFile, BranchDocumentAccess
from app.models.feedback import BranchFeedback
from app.models.health import BranchHealth, BranchHealthInspection, BranchHealthIncident
from app.models.maintenance import BranchMaintenance, BranchMaintenanceSchedule, BranchMaintenanceRecord
from app.models.quality import BranchQuality, BranchQualityReview, BranchQualityIssue
from app.models.reports import BranchReport, BranchReportSchedule, BranchReportExecution
from app.models.risk import BranchRisk, BranchRiskAssessment, BranchRiskMitigation
from app.models.security import BranchSecurity, BranchAccessLog, BranchSecurityIncident
from app.models.services import BranchService, BranchServiceSchedule, BranchServiceAppointment
from app.models.training import BranchTraining, BranchTrainingSession, BranchTrainingParticipant, BranchTrainingEnrollment, BranchTrainingAssessment, BranchTrainingAssessmentResult
from sqlalchemy.orm import configure_mappers

# For type checking
__all__ = [
    "Base",
    "User",
    "Role",
    "Permission",
    "Branch",
    "Product",
    "Employee",
    "Sale",
    "Customer",
    "Inventory",
    "StockMovement",
    "BranchInventory",
    "InventoryTransfer",
    "Transaction",
    "Notification",
    "NotificationSetting",
    "BranchNotification",
    "BranchNotificationRecipient",
    "Order",
    "Supplier",
    "Address",
    "Business",
    "SystemSetting",
    "BranchSettings",
    "BranchUserSettings",
    "IntegrationProvider",
    "IntegrationInstance",
    "IntegrationLog",
    "BranchIntegration",
    "BranchIntegrationLog",
    "BranchIntegrationMapping",
    "BranchTask",
    "BranchTaskComment",
    "BranchTaskChecklist",
    "BranchWorkflow",
    "BranchWorkflowStep",
    "BranchWorkflowInstance",
    "AnalyticsEvent",
    "AnalyticsMetric",
    "AnalyticsReport",
    "BranchAnalytics",
    "BranchAnalyticsReport",
    "BranchAudit",
    "BranchAuditConfig",
    "BranchAuditExport",
    "BranchDocument",
    "BranchDocumentFile",
    "BranchDocumentAccess",
    "BranchFeedback",
    "BranchHealth",
    "BranchHealthInspection",
    "BranchHealthIncident",
    "BranchMaintenance",
    "BranchMaintenanceSchedule",
    "BranchMaintenanceRecord",
    "BranchQuality",
    "BranchQualityReview",
    "BranchQualityIssue",
    "BranchReport",
    "BranchReportSchedule",
    "BranchReportExecution",
    "BranchRisk",
    "BranchRiskAssessment",
    "BranchRiskMitigation",
    "BranchSecurity",
    "BranchAccessLog",
    "BranchSecurityIncident",
    "BranchService",
    "BranchServiceSchedule",
    "BranchServiceAppointment",
    "BranchTraining",
    "BranchTrainingSession",
    "BranchTrainingParticipant",
    "BranchTrainingEnrollment",
    "BranchTrainingAssessment",
    "BranchTrainingAssessmentResult"
] 