from typing import Optional, List
from pydantic import BaseModel, constr, confloat
from datetime import datetime
from enum import Enum

class PerformanceMetricType(str, Enum):
    SALES = "sales"
    CUSTOMER_SATISFACTION = "customer_satisfaction"
    ATTENDANCE = "attendance"
    TASK_COMPLETION = "task_completion"
    EFFICIENCY = "efficiency"
    QUALITY = "quality"

class PerformanceRating(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    SATISFACTORY = "satisfactory"
    NEEDS_IMPROVEMENT = "needs_improvement"
    UNSATISFACTORY = "unsatisfactory"

class PerformanceMetricBase(BaseModel):
    type: PerformanceMetricType
    value: float
    target: float
    weight: confloat(ge=0, le=1) = 1.0
    notes: Optional[str] = None

class PerformanceMetricCreate(PerformanceMetricBase):
    employee_id: int
    period_start: datetime
    period_end: datetime

class PerformanceMetric(PerformanceMetricBase):
    id: int
    employee_id: int
    period_start: datetime
    period_end: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PerformanceReviewBase(BaseModel):
    employee_id: int
    reviewer_id: int
    period_start: datetime
    period_end: datetime
    rating: PerformanceRating
    strengths: Optional[List[str]] = None
    areas_for_improvement: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    comments: Optional[str] = None

class PerformanceReviewCreate(PerformanceReviewBase):
    pass

class PerformanceReview(PerformanceReviewBase):
    id: int
    metrics: List[PerformanceMetric] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    next_review_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class PerformanceSummary(BaseModel):
    employee_id: int
    period_start: datetime
    period_end: datetime
    metrics_summary: dict[PerformanceMetricType, float]
    overall_rating: PerformanceRating
    rating_trend: List[dict[str, any]]
    achievements: List[str]
    improvement_areas: List[str]

    class Config:
        from_attributes = True 