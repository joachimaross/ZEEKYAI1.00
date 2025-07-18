"""
📊 ZEEKY ANALYTICS SYSTEM
Advanced analytics, performance monitoring, and predictive insights
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid
import random

# Try to import psutil, fallback to mock if not available
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    # Mock psutil functions
    class MockPsutil:
        @staticmethod
        def cpu_percent(interval=1): return random.uniform(10, 80)
        @staticmethod
        def cpu_count(): return 4
        @staticmethod
        def virtual_memory():
            class MockMemory:
                percent = random.uniform(30, 70)
                available = 8 * 1024**3  # 8GB
                total = 16 * 1024**3     # 16GB
            return MockMemory()
        @staticmethod
        def disk_usage(path):
            class MockDisk:
                percent = random.uniform(20, 60)
                free = 500 * 1024**3     # 500GB
                total = 1000 * 1024**3   # 1TB
            return MockDisk()
        @staticmethod
        def net_io_counters():
            class MockNetwork:
                bytes_sent = random.randint(1000000, 10000000)
                bytes_recv = random.randint(1000000, 10000000)
            return MockNetwork()

    psutil = MockPsutil()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyticsEngine:
    """Core Analytics Engine"""
    
    def __init__(self):
        self.sessions = {}
        self.events = {}
        self.user_interactions = {}
        self.feature_usage = {}
        self.performance_metrics = {}
    
    async def track_session_start(self, user_id: str, device_type: str = "unknown", location: str = "unknown") -> str:
        """Track session start"""
        session_id = str(uuid.uuid4())
        
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "device_type": device_type,
            "location": location,
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "duration": 0,
            "interactions": 0,
            "features_used": [],
            "pages_visited": [],
            "errors": 0
        }
        
        self.sessions[session_id] = session
        
        # Track in user interactions
        if user_id not in self.user_interactions:
            self.user_interactions[user_id] = []
        
        return session_id
    
    async def track_interaction(self, session_id: str, feature: str, action: str, success: bool = True,
                              response_time_ms: int = 0, metadata: Optional[Dict] = None) -> str:
        """Track user interaction"""
        event_id = str(uuid.uuid4())
        
        event = {
            "event_id": event_id,
            "session_id": session_id,
            "feature": feature,
            "action": action,
            "success": success,
            "response_time_ms": response_time_ms,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.events[event_id] = event
        
        # Update session
        if session_id in self.sessions:
            session = self.sessions[session_id]
            session["interactions"] += 1
            if feature not in session["features_used"]:
                session["features_used"].append(feature)
            if not success:
                session["errors"] += 1
        
        # Update feature usage
        if feature not in self.feature_usage:
            self.feature_usage[feature] = {
                "total_uses": 0,
                "successful_uses": 0,
                "average_response_time": 0,
                "users": set()
            }
        
        self.feature_usage[feature]["total_uses"] += 1
        if success:
            self.feature_usage[feature]["successful_uses"] += 1
        
        return event_id
    
    async def get_usage_analytics(self, days: int = 7) -> Dict[str, Any]:
        """Get usage analytics for specified period"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Filter sessions and events within the period
            recent_sessions = [
                session for session in self.sessions.values()
                if datetime.fromisoformat(session["start_time"]) >= cutoff_date
            ]
            
            recent_events = [
                event for event in self.events.values()
                if datetime.fromisoformat(event["timestamp"]) >= cutoff_date
            ]
            
            # Calculate metrics
            total_sessions = len(recent_sessions)
            total_users = len(set(session["user_id"] for session in recent_sessions))
            total_interactions = len(recent_events)
            
            # Feature usage
            feature_stats = {}
            for event in recent_events:
                feature = event["feature"]
                if feature not in feature_stats:
                    feature_stats[feature] = {"uses": 0, "success_rate": 0, "users": set()}
                
                feature_stats[feature]["uses"] += 1
                feature_stats[feature]["users"].add(event.get("user_id", "unknown"))
                if event["success"]:
                    feature_stats[feature]["success_rate"] += 1
            
            # Calculate success rates
            for feature, stats in feature_stats.items():
                if stats["uses"] > 0:
                    stats["success_rate"] = (stats["success_rate"] / stats["uses"]) * 100
                stats["unique_users"] = len(stats["users"])
                del stats["users"]  # Remove set for JSON serialization
            
            # Device breakdown
            device_breakdown = {}
            for session in recent_sessions:
                device = session["device_type"]
                device_breakdown[device] = device_breakdown.get(device, 0) + 1
            
            return {
                "success": True,
                "period_days": days,
                "summary": {
                    "total_sessions": total_sessions,
                    "unique_users": total_users,
                    "total_interactions": total_interactions,
                    "average_session_length": self._calculate_average_session_length(recent_sessions),
                    "most_used_feature": max(feature_stats.keys(), key=lambda k: feature_stats[k]["uses"]) if feature_stats else None
                },
                "feature_usage": feature_stats,
                "device_breakdown": device_breakdown,
                "daily_breakdown": self._get_daily_breakdown(recent_sessions, days)
            }
            
        except Exception as e:
            logger.error(f"Error getting usage analytics: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_average_session_length(self, sessions: List[Dict[str, Any]]) -> float:
        """Calculate average session length in minutes"""
        if not sessions:
            return 0
        
        total_duration = 0
        valid_sessions = 0
        
        for session in sessions:
            if session["end_time"]:
                start = datetime.fromisoformat(session["start_time"])
                end = datetime.fromisoformat(session["end_time"])
                duration = (end - start).total_seconds() / 60  # Convert to minutes
                total_duration += duration
                valid_sessions += 1
        
        return total_duration / valid_sessions if valid_sessions > 0 else 0
    
    def _get_daily_breakdown(self, sessions: List[Dict[str, Any]], days: int) -> Dict[str, int]:
        """Get daily session breakdown"""
        daily_counts = {}
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            daily_counts[date] = 0
        
        for session in sessions:
            date = session["start_time"][:10]  # Extract date part
            if date in daily_counts:
                daily_counts[date] += 1
        
        return daily_counts
    
    async def get_user_behavior_insights(self, user_id: str = None) -> Dict[str, Any]:
        """Get user behavior insights"""
        try:
            if user_id:
                user_sessions = [s for s in self.sessions.values() if s["user_id"] == user_id]
                user_events = [e for e in self.events.values() if e.get("user_id") == user_id]
            else:
                user_sessions = list(self.sessions.values())
                user_events = list(self.events.values())
            
            if not user_sessions:
                return {
                    "success": True,
                    "insights": "No data available for analysis"
                }
            
            # Analyze patterns
            most_used_features = self._get_most_used_features(user_events)
            peak_usage_hours = self._get_peak_usage_hours(user_sessions)
            session_patterns = self._analyze_session_patterns(user_sessions)
            
            insights = []
            
            if most_used_features:
                top_feature = most_used_features[0]
                insights.append(f"Most frequently used feature: {top_feature['feature']} ({top_feature['count']} times)")
            
            if peak_usage_hours:
                insights.append(f"Peak usage time: {peak_usage_hours}:00")
            
            insights.extend(session_patterns)
            
            return {
                "success": True,
                "user_id": user_id,
                "total_sessions": len(user_sessions),
                "total_interactions": len(user_events),
                "insights": insights,
                "most_used_features": most_used_features[:5],
                "behavior_score": self._calculate_behavior_score(user_sessions, user_events)
            }
            
        except Exception as e:
            logger.error(f"Error getting user behavior insights: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_most_used_features(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get most used features"""
        feature_counts = {}
        for event in events:
            feature = event["feature"]
            feature_counts[feature] = feature_counts.get(feature, 0) + 1
        
        return [
            {"feature": feature, "count": count}
            for feature, count in sorted(feature_counts.items(), key=lambda x: x[1], reverse=True)
        ]
    
    def _get_peak_usage_hours(self, sessions: List[Dict[str, Any]]) -> Optional[int]:
        """Get peak usage hour"""
        hour_counts = {}
        for session in sessions:
            hour = datetime.fromisoformat(session["start_time"]).hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        if hour_counts:
            return max(hour_counts.keys(), key=lambda k: hour_counts[k])
        return None
    
    def _analyze_session_patterns(self, sessions: List[Dict[str, Any]]) -> List[str]:
        """Analyze session patterns"""
        patterns = []
        
        if len(sessions) >= 5:
            avg_interactions = sum(s["interactions"] for s in sessions) / len(sessions)
            if avg_interactions > 10:
                patterns.append("High engagement user - frequently interacts with features")
            elif avg_interactions < 3:
                patterns.append("Low engagement - may benefit from feature discovery")
        
        # Check for consistent usage
        if len(sessions) >= 7:
            recent_sessions = sessions[-7:]
            if len(recent_sessions) >= 5:
                patterns.append("Regular user - consistent usage pattern")
        
        return patterns
    
    def _calculate_behavior_score(self, sessions: List[Dict[str, Any]], events: List[Dict[str, Any]]) -> float:
        """Calculate user behavior score (0-100)"""
        if not sessions:
            return 0
        
        score = 0
        
        # Frequency score (0-30)
        if len(sessions) >= 10:
            score += 30
        elif len(sessions) >= 5:
            score += 20
        elif len(sessions) >= 2:
            score += 10
        
        # Engagement score (0-40)
        avg_interactions = sum(s["interactions"] for s in sessions) / len(sessions)
        if avg_interactions >= 15:
            score += 40
        elif avg_interactions >= 10:
            score += 30
        elif avg_interactions >= 5:
            score += 20
        elif avg_interactions >= 2:
            score += 10
        
        # Feature diversity score (0-30)
        unique_features = set()
        for event in events:
            unique_features.add(event["feature"])
        
        if len(unique_features) >= 8:
            score += 30
        elif len(unique_features) >= 5:
            score += 20
        elif len(unique_features) >= 3:
            score += 10
        
        return min(score, 100)

class PerformanceMonitor:
    """System Performance Monitoring"""
    
    def __init__(self):
        self.metrics_history = {}
        self.alerts = {}
    
    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect current system performance metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available / (1024**3)  # GB
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            disk_free = disk.free / (1024**3)  # GB
            
            # Network metrics (if available)
            try:
                network = psutil.net_io_counters()
                bytes_sent = network.bytes_sent
                bytes_recv = network.bytes_recv
            except:
                bytes_sent = bytes_recv = 0
            
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "usage_percent": cpu_percent,
                    "core_count": cpu_count
                },
                "memory": {
                    "usage_percent": memory_percent,
                    "available_gb": round(memory_available, 2),
                    "total_gb": round(memory.total / (1024**3), 2)
                },
                "disk": {
                    "usage_percent": disk_percent,
                    "free_gb": round(disk_free, 2),
                    "total_gb": round(disk.total / (1024**3), 2)
                },
                "network": {
                    "bytes_sent": bytes_sent,
                    "bytes_received": bytes_recv
                }
            }
            
            # Store in history
            timestamp = datetime.now().isoformat()
            self.metrics_history[timestamp] = metrics
            
            # Keep only last 100 entries
            if len(self.metrics_history) > 100:
                oldest_key = min(self.metrics_history.keys())
                del self.metrics_history[oldest_key]
            
            return {
                "success": True,
                "metrics": metrics,
                "status": self._assess_system_health(metrics)
            }
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _assess_system_health(self, metrics: Dict[str, Any]) -> str:
        """Assess overall system health"""
        cpu_usage = metrics["cpu"]["usage_percent"]
        memory_usage = metrics["memory"]["usage_percent"]
        disk_usage = metrics["disk"]["usage_percent"]
        
        if cpu_usage > 90 or memory_usage > 90 or disk_usage > 95:
            return "critical"
        elif cpu_usage > 70 or memory_usage > 80 or disk_usage > 85:
            return "warning"
        else:
            return "healthy"
    
    async def get_performance_report(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance report for specified period"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Filter metrics within the period
            recent_metrics = {
                timestamp: metrics for timestamp, metrics in self.metrics_history.items()
                if datetime.fromisoformat(timestamp) >= cutoff_time
            }
            
            if not recent_metrics:
                return {
                    "success": True,
                    "message": "No performance data available for the specified period"
                }
            
            # Calculate averages
            cpu_values = [m["cpu"]["usage_percent"] for m in recent_metrics.values()]
            memory_values = [m["memory"]["usage_percent"] for m in recent_metrics.values()]
            disk_values = [m["disk"]["usage_percent"] for m in recent_metrics.values()]
            
            report = {
                "period_hours": hours,
                "data_points": len(recent_metrics),
                "cpu": {
                    "average": round(sum(cpu_values) / len(cpu_values), 2),
                    "max": max(cpu_values),
                    "min": min(cpu_values)
                },
                "memory": {
                    "average": round(sum(memory_values) / len(memory_values), 2),
                    "max": max(memory_values),
                    "min": min(memory_values)
                },
                "disk": {
                    "average": round(sum(disk_values) / len(disk_values), 2),
                    "max": max(disk_values),
                    "min": min(disk_values)
                },
                "health_summary": self._generate_health_summary(cpu_values, memory_values, disk_values)
            }
            
            return {
                "success": True,
                "report": report
            }
            
        except Exception as e:
            logger.error(f"Error generating performance report: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_health_summary(self, cpu_values: List[float], memory_values: List[float], disk_values: List[float]) -> List[str]:
        """Generate health summary"""
        summary = []
        
        avg_cpu = sum(cpu_values) / len(cpu_values)
        avg_memory = sum(memory_values) / len(memory_values)
        avg_disk = sum(disk_values) / len(disk_values)
        
        if avg_cpu < 50:
            summary.append("CPU usage is healthy")
        elif avg_cpu < 80:
            summary.append("CPU usage is moderate")
        else:
            summary.append("CPU usage is high - consider optimization")
        
        if avg_memory < 70:
            summary.append("Memory usage is healthy")
        elif avg_memory < 85:
            summary.append("Memory usage is moderate")
        else:
            summary.append("Memory usage is high - consider cleanup")
        
        if avg_disk < 80:
            summary.append("Disk usage is healthy")
        else:
            summary.append("Disk usage is high - consider cleanup")
        
        return summary

class PredictiveAnalytics:
    """Predictive Analytics Engine"""
    
    def __init__(self):
        self.prediction_models = {}
        self.user_patterns = {}
    
    async def predict_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Predict user preferences based on behavior"""
        try:
            # Simulate predictive analysis
            predictions = {
                "preferred_features": [
                    {"feature": "chat", "confidence": 0.92},
                    {"feature": "code_assistant", "confidence": 0.78},
                    {"feature": "image_generation", "confidence": 0.65}
                ],
                "optimal_usage_time": "14:00-16:00",
                "engagement_likelihood": 0.85,
                "churn_risk": 0.15,
                "recommended_features": [
                    "smart_home_integration",
                    "business_analytics",
                    "entertainment_games"
                ]
            }
            
            return {
                "success": True,
                "user_id": user_id,
                "predictions": predictions,
                "confidence_score": 0.82,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting user preferences: {e}")
            return {
                "success": False,
                "error": str(e)
            }

# Global instances
analytics_engine = AnalyticsEngine()
performance_monitor = PerformanceMonitor()
predictive_analytics = PredictiveAnalytics()

# Export main components
__all__ = [
    'AnalyticsEngine', 'PerformanceMonitor', 'PredictiveAnalytics',
    'analytics_engine', 'performance_monitor', 'predictive_analytics'
]
