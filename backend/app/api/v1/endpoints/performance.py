from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core.security import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/metrics/", response_model=schemas.PerformanceMetric)
def create_performance_metric(
    *,
    db: Session = Depends(deps.get_db),
    metric_in: schemas.PerformanceMetricCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new performance metric.
    """
    if not current_user.has_permission("manage_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    metric = crud.performance.create_metric(db=db, obj_in=metric_in)
    return metric

@router.get("/metrics/", response_model=List[schemas.PerformanceMetric])
def get_performance_metrics(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int = Query(None),
    metric_type: schemas.PerformanceMetricType = None,
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve performance metrics.
    """
    if not current_user.has_permission("view_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    metrics = crud.performance.get_metrics(
        db=db,
        employee_id=employee_id,
        metric_type=metric_type,
        start_date=start_date,
        end_date=end_date
    )
    return metrics

@router.post("/reviews/", response_model=schemas.PerformanceReview)
def create_performance_review(
    *,
    db: Session = Depends(deps.get_db),
    review_in: schemas.PerformanceReviewCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new performance review.
    """
    if not current_user.has_permission("manage_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    review = crud.performance.create_review(
        db=db,
        obj_in=review_in,
        reviewer_id=current_user.id
    )
    return review

@router.get("/reviews/", response_model=List[schemas.PerformanceReview])
def get_performance_reviews(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int = Query(None),
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve performance reviews.
    """
    if not current_user.has_permission("view_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    reviews = crud.performance.get_reviews(
        db=db,
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date
    )
    return reviews

@router.get("/reviews/{review_id}", response_model=schemas.PerformanceReview)
def get_performance_review(
    *,
    db: Session = Depends(deps.get_db),
    review_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get performance review by ID.
    """
    if not current_user.has_permission("view_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    review = crud.performance.get_review(db=db, id=review_id)
    if not review:
        raise HTTPException(
            status_code=404,
            detail="Performance review not found"
        )
    return review

@router.get("/summary/{employee_id}", response_model=schemas.PerformanceSummary)
def get_performance_summary(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
    period: int = Query(3, description="Period in months"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get performance summary for employee.
    """
    if not current_user.has_permission("view_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=period * 30)
    
    summary = crud.performance.get_summary(
        db=db,
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date
    )
    return summary

@router.get("/dashboard/{employee_id}", response_model=dict)
def get_performance_dashboard(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
    period: int = Query(12, description="Period in months"),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get performance dashboard data for employee.
    """
    if not current_user.has_permission("view_performance"):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions"
        )
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=period * 30)
    
    dashboard_data = crud.performance.get_dashboard_data(
        db=db,
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date
    )
    return dashboard_data 