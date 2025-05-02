from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..utils.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
from sqlalchemy import func

from ..services.analytics_service import AnalyticsService
from ..utils.decorators import admin_required
from ..models import SaleItem, Sale, Product, User
from ..models import Expense, Revenue, FinancialReport
from ..extensions import get_db

router = APIRouter()

# Pydantic models
class EventBase(BaseModel):
    event_type: str
    event_data: Optional[dict] = None

class MetricBase(BaseModel):
    metric_type: str
    metric_value: float
    metric_date: Optional[date] = None

class ReportBase(BaseModel):
    report_type: str
    start_date: date
    end_date: date

class ExpenseBase(BaseModel):
    branch_id: int
    category: str
    amount: float
    description: Optional[str] = None
    date: date

class RevenueBase(BaseModel):
    branch_id: int
    category: str
    amount: float
    description: Optional[str] = None
    date: date

# Routes
@router.get("/dashboard")
async def get_dashboard_analytics(
    time_range: str = Query("30days", description="Time range for analytics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_dashboard_metrics(time_range)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/sales")
async def get_sales_analytics(
    start_date: date = Query(..., description="Start date for analytics"),
    end_date: date = Query(..., description="End date for analytics"),
    group_by: str = Query("day", description="Grouping for analytics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_dashboard_metrics()
        return {
            'sales_data': metrics['sales_metrics']['daily_sales']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/products")
async def get_product_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_dashboard_metrics()
        return {
            'product_metrics': metrics['product_metrics']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/customers")
async def get_customer_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_dashboard_metrics()
        return {
            'customer_metrics': metrics['customer_metrics']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/inventory")
async def get_inventory_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_inventory_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/events")
async def track_event(
    event: EventBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not event.event_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event type is required"
            )

        tracked_event = AnalyticsService.track_event(
            event_type=event.event_type,
            event_data=event.event_data,
            user_id=current_user.id
        )
        return tracked_event
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/metrics")
async def record_metric(
    metric: MetricBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    try:
        if not metric.metric_type or metric.metric_value is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Metric type and value are required"
            )

        recorded_metric = AnalyticsService.record_metric(
            metric_type=metric.metric_type,
            metric_value=metric.metric_value,
            metric_date=metric.metric_date
        )
        return recorded_metric
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reports")
async def generate_report(
    report: ReportBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required())
):
    try:
        if not all([report.report_type, report.start_date, report.end_date]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Report type, start date, and end date are required"
            )

        generated_report = AnalyticsService.generate_report(
            report_type=report.report_type,
            start_date=report.start_date,
            end_date=report.end_date,
            created_by=current_user.id
        )
        return generated_report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/reports/{report_type}")
async def get_reports(
    report_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        reports = AnalyticsReport.get_reports_by_type(report_type, current_user.id)
        return reports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/financial/expenses")
async def add_expense(
    expense: ExpenseBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_expense = Expense(
            branch_id=expense.branch_id,
            category=expense.category,
            amount=expense.amount,
            description=expense.description,
            date=expense.date
        )
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        
        return db_expense
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/financial/revenue")
async def add_revenue(
    revenue: RevenueBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_revenue = Revenue(
            branch_id=revenue.branch_id,
            category=revenue.category,
            amount=revenue.amount,
            description=revenue.description,
            date=revenue.date
        )
        db.add(db_revenue)
        db.commit()
        db.refresh(db_revenue)
        
        return db_revenue
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/financial/report")
async def get_financial_report(
    branch_id: int = Query(..., description="Branch ID"),
    start_date: date = Query(..., description="Start date"),
    end_date: date = Query(..., description="End date"),
    report_type: str = Query("monthly", description="Report type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not all([branch_id, start_date, end_date]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required parameters"
            )
        
        # Get total revenue
        total_revenue = db.query(func.sum(Revenue.amount))\
            .filter(
                Revenue.branch_id == branch_id,
                Revenue.date.between(start_date, end_date)
            ).scalar() or 0
        
        # Get total expenses
        total_expenses = db.query(func.sum(Expense.amount))\
            .filter(
                Expense.branch_id == branch_id,
                Expense.date.between(start_date, end_date)
            ).scalar() or 0
        
        # Calculate net profit
        net_profit = total_revenue - total_expenses
        
        # Create or update financial report
        report = db.query(FinancialReport).filter_by(
            branch_id=branch_id,
            start_date=start_date,
            end_date=end_date,
            report_type=report_type
        ).first()
        
        if not report:
            report = FinancialReport(
                branch_id=branch_id,
                start_date=start_date,
                end_date=end_date,
                total_revenue=total_revenue,
                total_expenses=total_expenses,
                net_profit=net_profit,
                report_type=report_type
            )
            db.add(report)
        else:
            report.total_revenue = total_revenue
            report.total_expenses = total_expenses
            report.net_profit = net_profit
        
        db.commit()
        db.refresh(report)
        
        return report
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/suppliers")
async def get_supplier_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = AnalyticsService.get_supplier_metrics()
        return {"supplier_metrics": metrics}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 