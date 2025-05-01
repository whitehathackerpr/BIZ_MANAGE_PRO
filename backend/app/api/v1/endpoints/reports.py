from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/sales/summary", response_model=schemas.SalesSummary)
def get_sales_summary(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get sales summary for a business.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    summary = crud.reports.get_sales_summary(
        db=db,
        business_id=business_id,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
    )
    return summary

@router.get("/inventory/summary", response_model=schemas.InventorySummary)
def get_inventory_summary(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_id: int = Query(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get inventory summary for a business.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    summary = crud.reports.get_inventory_summary(
        db=db,
        business_id=business_id,
        branch_id=branch_id,
    )
    return summary

@router.get("/sales/trends", response_model=List[schemas.SalesTrend])
def get_sales_trends(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    interval: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get sales trends over time.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    trends = crud.reports.get_sales_trends(
        db=db,
        business_id=business_id,
        interval=interval,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
    )
    return trends

@router.get("/products/performance", response_model=List[schemas.ProductPerformance])
def get_product_performance(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    limit: int = Query(10),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get product performance metrics.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    performance = crud.reports.get_product_performance(
        db=db,
        business_id=business_id,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
        limit=limit,
    )
    return performance

@router.get("/customers/insights", response_model=List[schemas.CustomerInsight])
def get_customer_insights(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    limit: int = Query(10),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get customer insights and analytics.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    insights = crud.reports.get_customer_insights(
        db=db,
        business_id=business_id,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
        limit=limit,
    )
    return insights

@router.get("/inventory/alerts", response_model=List[schemas.InventoryAlert])
def get_inventory_alerts(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    branch_id: int = Query(None),
    alert_type: str = Query(None, enum=["low_stock", "expiring", "overstock"]),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get inventory alerts and notifications.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    alerts = crud.reports.get_inventory_alerts(
        db=db,
        business_id=business_id,
        branch_id=branch_id,
        alert_type=alert_type,
    )
    return alerts

@router.get("/financial/metrics", response_model=schemas.FinancialMetrics)
def get_financial_metrics(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get financial metrics and KPIs.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    metrics = crud.reports.get_financial_metrics(
        db=db,
        business_id=business_id,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
    )
    return metrics

@router.get("/staff/performance", response_model=List[schemas.StaffPerformance])
def get_staff_performance(
    *,
    db: Session = Depends(deps.get_db),
    business_id: int,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    branch_id: int = Query(None),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get staff performance metrics.
    """
    if not current_user.has_permission("view_reports"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions",
        )
    
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
        
    performance = crud.reports.get_staff_performance(
        db=db,
        business_id=business_id,
        start_date=start_date,
        end_date=end_date,
        branch_id=branch_id,
    )
    return performance 