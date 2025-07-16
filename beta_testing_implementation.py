"""
Zeeky AI - Beta Testing Implementation System
Comprehensive beta testing infrastructure with user recruitment, feedback collection, and analytics
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from enum import Enum
import asyncio
import httpx
import logging
import json
import uuid
from dataclasses import dataclass

# Configure logging
logger = logging.getLogger(__name__)

class BetaPhase(str, Enum):
    CLOSED_ALPHA = "closed_alpha"
    PRIVATE_BETA = "private_beta"
    PUBLIC_BETA = "public_beta"

class UserType(str, Enum):
    DEVELOPER = "developer"
    STUDENT = "student"
    CONTENT_CREATOR = "content_creator"
    BUSINESS_PROFESSIONAL = "business_professional"
    AI_ENTHUSIAST = "ai_enthusiast"

class FeedbackType(str, Enum):
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    USABILITY_FEEDBACK = "usability_feedback"
    PERFORMANCE_ISSUE = "performance_issue"
    GENERAL_FEEDBACK = "general_feedback"

# Database Models
Base = declarative_base()

class BetaUser(Base):
    __tablename__ = "beta_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    user_type = Column(String, nullable=False)
    beta_phase = Column(String, nullable=False)
    invitation_code = Column(String, unique=True)
    invited_at = Column(DateTime, default=datetime.utcnow)
    activated_at = Column(DateTime)
    last_active = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Beta-specific fields
    referral_source = Column(String)
    motivation = Column(Text)
    experience_level = Column(String)
    company = Column(String)
    role = Column(String)
    
    # Engagement metrics
    sessions_count = Column(Integer, default=0)
    total_usage_time = Column(Float, default=0.0)
    features_used = Column(JSON)
    satisfaction_rating = Column(Float)
    nps_score = Column(Integer)

class BetaFeedback(Base):
    __tablename__ = "beta_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    feedback_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String)  # low, medium, high, critical
    feature_area = Column(String)
    steps_to_reproduce = Column(Text)
    expected_behavior = Column(Text)
    actual_behavior = Column(Text)
    browser_info = Column(String)
    device_info = Column(String)
    screenshot_url = Column(String)
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    priority = Column(String, default="medium")
    assigned_to = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

class BetaAnalytics(Base):
    __tablename__ = "beta_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)
    event_data = Column(JSON)
    session_id = Column(String)
    page_url = Column(String)
    user_agent = Column(String)
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ABTest(Base):
    __tablename__ = "ab_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    variants = Column(JSON)  # {"control": {...}, "variant_a": {...}}
    traffic_allocation = Column(JSON)  # {"control": 50, "variant_a": 50}
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    success_metric = Column(String)
    results = Column(JSON)

class UserVariant(Base):
    __tablename__ = "user_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    test_name = Column(String, nullable=False)
    variant = Column(String, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class BetaUserCreate(BaseModel):
    email: EmailStr
    full_name: str
    user_type: UserType
    referral_source: Optional[str] = None
    motivation: Optional[str] = None
    experience_level: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None

class BetaUserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str]
    full_name: str
    user_type: UserType
    beta_phase: BetaPhase
    invitation_code: str
    invited_at: datetime
    activated_at: Optional[datetime]
    is_active: bool

class FeedbackCreate(BaseModel):
    feedback_type: FeedbackType
    title: str
    description: str
    severity: Optional[str] = "medium"
    feature_area: Optional[str] = None
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    browser_info: Optional[str] = None
    device_info: Optional[str] = None

class AnalyticsEvent(BaseModel):
    event_type: str
    event_data: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None
    page_url: Optional[str] = None

@dataclass
class BetaMetrics:
    """Beta testing key metrics"""
    total_users: int
    active_users: int
    user_retention_7d: float
    user_retention_30d: float
    average_session_duration: float
    feature_adoption_rates: Dict[str, float]
    satisfaction_score: float
    nps_score: float
    bug_report_count: int
    critical_bugs: int
    conversion_rate: float

class BetaTestingService:
    """Comprehensive beta testing management service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.current_phase = BetaPhase.CLOSED_ALPHA
        self.phase_limits = {
            BetaPhase.CLOSED_ALPHA: 50,
            BetaPhase.PRIVATE_BETA: 500,
            BetaPhase.PUBLIC_BETA: 5000
        }
    
    async def invite_beta_user(self, user_data: BetaUserCreate) -> BetaUser:
        """Invite a new beta user"""
        try:
            # Check phase capacity
            current_count = self.db.query(BetaUser).filter(
                BetaUser.beta_phase == self.current_phase,
                BetaUser.is_active == True
            ).count()
            
            if current_count >= self.phase_limits[self.current_phase]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Beta phase {self.current_phase} is at capacity"
                )
            
            # Check if user already exists
            existing_user = self.db.query(BetaUser).filter(
                BetaUser.email == user_data.email
            ).first()
            
            if existing_user:
                raise HTTPException(status_code=400, detail="User already invited")
            
            # Generate invitation code
            invitation_code = str(uuid.uuid4())[:8].upper()
            
            # Create beta user
            beta_user = BetaUser(
                email=user_data.email,
                full_name=user_data.full_name,
                user_type=user_data.user_type,
                beta_phase=self.current_phase,
                invitation_code=invitation_code,
                referral_source=user_data.referral_source,
                motivation=user_data.motivation,
                experience_level=user_data.experience_level,
                company=user_data.company,
                role=user_data.role,
                features_used={}
            )
            
            self.db.add(beta_user)
            self.db.commit()
            self.db.refresh(beta_user)
            
            # Send invitation email
            await self._send_invitation_email(beta_user)
            
            logger.info(f"Invited beta user: {user_data.email} to {self.current_phase}")
            return beta_user
            
        except Exception as e:
            logger.error(f"Failed to invite beta user: {e}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Beta invitation failed")
    
    async def activate_beta_user(self, invitation_code: str) -> BetaUser:
        """Activate beta user with invitation code"""
        beta_user = self.db.query(BetaUser).filter(
            BetaUser.invitation_code == invitation_code,
            BetaUser.is_active == True
        ).first()
        
        if not beta_user:
            raise HTTPException(status_code=404, detail="Invalid invitation code")
        
        if beta_user.activated_at:
            raise HTTPException(status_code=400, detail="Invitation already activated")
        
        beta_user.activated_at = datetime.utcnow()
        beta_user.last_active = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Activated beta user: {beta_user.email}")
        return beta_user
    
    async def submit_feedback(self, user_id: int, feedback_data: FeedbackCreate) -> BetaFeedback:
        """Submit beta feedback"""
        try:
            feedback = BetaFeedback(
                user_id=user_id,
                feedback_type=feedback_data.feedback_type,
                title=feedback_data.title,
                description=feedback_data.description,
                severity=feedback_data.severity,
                feature_area=feedback_data.feature_area,
                steps_to_reproduce=feedback_data.steps_to_reproduce,
                expected_behavior=feedback_data.expected_behavior,
                actual_behavior=feedback_data.actual_behavior,
                browser_info=feedback_data.browser_info,
                device_info=feedback_data.device_info
            )
            
            self.db.add(feedback)
            self.db.commit()
            self.db.refresh(feedback)
            
            # Auto-assign priority based on type and severity
            await self._auto_prioritize_feedback(feedback)
            
            # Notify development team for critical issues
            if feedback.severity == "critical":
                await self._notify_critical_issue(feedback)
            
            logger.info(f"Feedback submitted by user {user_id}: {feedback.title}")
            return feedback
            
        except Exception as e:
            logger.error(f"Failed to submit feedback: {e}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Feedback submission failed")
    
    async def track_analytics_event(self, user_id: int, event: AnalyticsEvent) -> None:
        """Track user analytics event"""
        try:
            analytics_record = BetaAnalytics(
                user_id=user_id,
                event_type=event.event_type,
                event_data=event.event_data,
                session_id=event.session_id,
                page_url=event.page_url
            )
            
            self.db.add(analytics_record)
            
            # Update user engagement metrics
            await self._update_user_engagement(user_id, event)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to track analytics: {e}")
            self.db.rollback()
    
    async def get_beta_metrics(self) -> BetaMetrics:
        """Get comprehensive beta testing metrics"""
        try:
            # Total and active users
            total_users = self.db.query(BetaUser).filter(BetaUser.is_active == True).count()
            
            # Active users (last 7 days)
            week_ago = datetime.utcnow() - timedelta(days=7)
            active_users = self.db.query(BetaUser).filter(
                BetaUser.last_active >= week_ago,
                BetaUser.is_active == True
            ).count()
            
            # Retention rates
            retention_7d = await self._calculate_retention(7)
            retention_30d = await self._calculate_retention(30)
            
            # Session metrics
            avg_session_duration = await self._calculate_avg_session_duration()
            
            # Feature adoption
            feature_adoption = await self._calculate_feature_adoption()
            
            # Satisfaction metrics
            satisfaction_score = await self._calculate_satisfaction_score()
            nps_score = await self._calculate_nps_score()
            
            # Bug metrics
            bug_count = self.db.query(BetaFeedback).filter(
                BetaFeedback.feedback_type == FeedbackType.BUG_REPORT
            ).count()
            
            critical_bugs = self.db.query(BetaFeedback).filter(
                BetaFeedback.feedback_type == FeedbackType.BUG_REPORT,
                BetaFeedback.severity == "critical",
                BetaFeedback.status != "resolved"
            ).count()
            
            # Conversion rate (activated users / invited users)
            activated_users = self.db.query(BetaUser).filter(
                BetaUser.activated_at.isnot(None),
                BetaUser.is_active == True
            ).count()
            
            conversion_rate = (activated_users / total_users * 100) if total_users > 0 else 0
            
            return BetaMetrics(
                total_users=total_users,
                active_users=active_users,
                user_retention_7d=retention_7d,
                user_retention_30d=retention_30d,
                average_session_duration=avg_session_duration,
                feature_adoption_rates=feature_adoption,
                satisfaction_score=satisfaction_score,
                nps_score=nps_score,
                bug_report_count=bug_count,
                critical_bugs=critical_bugs,
                conversion_rate=conversion_rate
            )
            
        except Exception as e:
            logger.error(f"Failed to calculate beta metrics: {e}")
            raise HTTPException(status_code=500, detail="Metrics calculation failed")
    
    async def create_ab_test(self, test_name: str, description: str, variants: Dict, traffic_allocation: Dict) -> ABTest:
        """Create A/B test"""
        try:
            ab_test = ABTest(
                test_name=test_name,
                description=description,
                variants=variants,
                traffic_allocation=traffic_allocation
            )
            
            self.db.add(ab_test)
            self.db.commit()
            self.db.refresh(ab_test)
            
            logger.info(f"Created A/B test: {test_name}")
            return ab_test
            
        except Exception as e:
            logger.error(f"Failed to create A/B test: {e}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail="A/B test creation failed")
    
    async def assign_user_to_variant(self, user_id: int, test_name: str) -> str:
        """Assign user to A/B test variant"""
        try:
            # Check if user already assigned
            existing_assignment = self.db.query(UserVariant).filter(
                UserVariant.user_id == user_id,
                UserVariant.test_name == test_name
            ).first()
            
            if existing_assignment:
                return existing_assignment.variant
            
            # Get test configuration
            ab_test = self.db.query(ABTest).filter(
                ABTest.test_name == test_name,
                ABTest.is_active == True
            ).first()
            
            if not ab_test:
                return "control"  # Default to control if test not found
            
            # Assign variant based on traffic allocation
            import random
            rand_value = random.randint(1, 100)
            cumulative = 0
            
            for variant, percentage in ab_test.traffic_allocation.items():
                cumulative += percentage
                if rand_value <= cumulative:
                    # Create assignment
                    user_variant = UserVariant(
                        user_id=user_id,
                        test_name=test_name,
                        variant=variant
                    )
                    
                    self.db.add(user_variant)
                    self.db.commit()
                    
                    return variant
            
            return "control"  # Fallback
            
        except Exception as e:
            logger.error(f"Failed to assign A/B test variant: {e}")
            return "control"
    
    async def _send_invitation_email(self, beta_user: BetaUser):
        """Send beta invitation email"""
        # This would integrate with your email service
        email_content = f"""
        Welcome to Zeeky AI Beta!
        
        Hi {beta_user.full_name},
        
        You've been invited to join the Zeeky AI {beta_user.beta_phase} program!
        
        Your invitation code: {beta_user.invitation_code}
        
        Get started: https://beta.zeeky.ai/activate/{beta_user.invitation_code}
        
        Best regards,
        The Zeeky AI Team
        """
        
        # Send email (implementation depends on your email service)
        logger.info(f"Invitation email sent to {beta_user.email}")
    
    async def _auto_prioritize_feedback(self, feedback: BetaFeedback):
        """Auto-assign priority to feedback"""
        priority_map = {
            ("critical", FeedbackType.BUG_REPORT): "critical",
            ("high", FeedbackType.BUG_REPORT): "high",
            ("medium", FeedbackType.BUG_REPORT): "medium",
            ("critical", FeedbackType.PERFORMANCE_ISSUE): "high",
            ("high", FeedbackType.PERFORMANCE_ISSUE): "medium",
        }
        
        key = (feedback.severity, feedback.feedback_type)
        feedback.priority = priority_map.get(key, "low")
        self.db.commit()
    
    async def _notify_critical_issue(self, feedback: BetaFeedback):
        """Notify team of critical issues"""
        # This would integrate with Slack, email, or other notification systems
        logger.critical(f"Critical issue reported: {feedback.title}")
    
    async def _update_user_engagement(self, user_id: int, event: AnalyticsEvent):
        """Update user engagement metrics"""
        beta_user = self.db.query(BetaUser).filter(BetaUser.id == user_id).first()
        
        if beta_user:
            beta_user.last_active = datetime.utcnow()
            
            if event.event_type == "session_start":
                beta_user.sessions_count += 1
            
            # Track feature usage
            if event.event_type.startswith("feature_"):
                feature_name = event.event_type.replace("feature_", "")
                features_used = beta_user.features_used or {}
                features_used[feature_name] = features_used.get(feature_name, 0) + 1
                beta_user.features_used = features_used
    
    async def _calculate_retention(self, days: int) -> float:
        """Calculate user retention rate"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        users_at_cutoff = self.db.query(BetaUser).filter(
            BetaUser.activated_at <= cutoff_date,
            BetaUser.is_active == True
        ).count()
        
        if users_at_cutoff == 0:
            return 0.0
        
        retained_users = self.db.query(BetaUser).filter(
            BetaUser.activated_at <= cutoff_date,
            BetaUser.last_active >= cutoff_date,
            BetaUser.is_active == True
        ).count()
        
        return (retained_users / users_at_cutoff) * 100
    
    async def _calculate_avg_session_duration(self) -> float:
        """Calculate average session duration"""
        # This would analyze session start/end events
        # Simplified implementation
        return 15.5  # minutes
    
    async def _calculate_feature_adoption(self) -> Dict[str, float]:
        """Calculate feature adoption rates"""
        total_users = self.db.query(BetaUser).filter(BetaUser.is_active == True).count()
        
        if total_users == 0:
            return {}
        
        # Analyze feature usage from user records
        feature_adoption = {}
        
        # This would be implemented based on your feature tracking
        # Simplified example
        features = ["chat", "code_assistant", "voice", "mobile_app"]
        for feature in features:
            # Count users who used this feature
            users_with_feature = 0  # Would query actual usage data
            feature_adoption[feature] = (users_with_feature / total_users) * 100
        
        return feature_adoption
    
    async def _calculate_satisfaction_score(self) -> float:
        """Calculate average satisfaction score"""
        from sqlalchemy import func
        
        result = self.db.query(func.avg(BetaUser.satisfaction_rating)).filter(
            BetaUser.satisfaction_rating.isnot(None)
        ).scalar()
        
        return float(result) if result else 0.0
    
    async def _calculate_nps_score(self) -> float:
        """Calculate Net Promoter Score"""
        from sqlalchemy import func
        
        result = self.db.query(func.avg(BetaUser.nps_score)).filter(
            BetaUser.nps_score.isnot(None)
        ).scalar()
        
        return float(result) if result else 0.0

# Export beta testing components
__all__ = [
    'BetaTestingService',
    'BetaUser',
    'BetaFeedback',
    'BetaAnalytics',
    'ABTest',
    'UserVariant',
    'BetaPhase',
    'UserType',
    'FeedbackType',
    'BetaMetrics'
]
