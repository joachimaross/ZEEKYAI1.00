"""
💼 ZEEKY MARKETPLACE SYSTEM
Advanced freelance marketplace platform - Fiverr-like functionality
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid

class MarketplaceSystem:
    """Advanced Marketplace System - Fiverr-like functionality"""
    
    def __init__(self):
        self.categories = self._initialize_categories()
        self.services = {}
        self.orders = {}
        self.users = {}
        self.reviews = {}
        self.payment_processor = MarketplacePayments()
        self.messaging_system = MarketplaceMessaging()
        
    def _initialize_categories(self):
        """Initialize service categories"""
        return {
            "programming": {
                "name": "Programming & Tech",
                "subcategories": [
                    "Web Development", "Mobile Apps", "Desktop Applications",
                    "AI & Machine Learning", "Blockchain", "Game Development",
                    "DevOps & Cloud", "Cybersecurity", "Data Science"
                ]
            },
            "design": {
                "name": "Graphics & Design",
                "subcategories": [
                    "Logo Design", "Web Design", "App Design", "Print Design",
                    "Brand Identity", "Illustration", "3D Design", "Video Editing"
                ]
            },
            "writing": {
                "name": "Writing & Translation",
                "subcategories": [
                    "Content Writing", "Copywriting", "Technical Writing",
                    "Translation", "Proofreading", "Creative Writing", "SEO Writing"
                ]
            },
            "marketing": {
                "name": "Digital Marketing",
                "subcategories": [
                    "Social Media Marketing", "SEO", "Content Marketing",
                    "Email Marketing", "PPC Advertising", "Influencer Marketing"
                ]
            },
            "business": {
                "name": "Business",
                "subcategories": [
                    "Business Consulting", "Financial Consulting", "Legal Consulting",
                    "HR Consulting", "Project Management", "Business Plans"
                ]
            },
            "ai_services": {
                "name": "AI Services",
                "subcategories": [
                    "AI Chatbots", "AI Content Generation", "AI Image Generation",
                    "AI Data Analysis", "AI Automation", "AI Training"
                ]
            }
        }
    
    async def create_service_listing(self, seller_id: str, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new service listing"""
        try:
            service_id = str(uuid.uuid4())
            
            # Validate service data
            validation = await self._validate_service_data(service_data)
            if not validation["valid"]:
                return {"success": False, "error": validation["errors"]}
            
            # Create service listing
            service = {
                "id": service_id,
                "seller_id": seller_id,
                "title": service_data["title"],
                "description": service_data["description"],
                "category": service_data["category"],
                "subcategory": service_data["subcategory"],
                "packages": await self._create_packages(service_data["packages"]),
                "gallery": service_data.get("gallery", []),
                "tags": service_data.get("tags", []),
                "requirements": service_data.get("requirements", []),
                "faq": service_data.get("faq", []),
                "delivery_time": service_data["delivery_time"],
                "revisions": service_data.get("revisions", 1),
                "status": "pending_approval",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "views": 0,
                "orders": 0,
                "rating": 0.0,
                "reviews_count": 0
            }
            
            # Store service
            self.services[service_id] = service
            
            # Auto-approve for demo (in production, would require manual review)
            service["status"] = "active"
            
            return {
                "success": True,
                "service_id": service_id,
                "service": service,
                "message": "Service listing created successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Service creation failed: {str(e)}"}
    
    async def _validate_service_data(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate service listing data"""
        errors = []
        
        required_fields = ["title", "description", "category", "packages", "delivery_time"]
        for field in required_fields:
            if field not in service_data or not service_data[field]:
                errors.append(f"Missing required field: {field}")
        
        if "category" in service_data and service_data["category"] not in self.categories:
            errors.append("Invalid category")
        
        if "packages" in service_data and len(service_data["packages"]) == 0:
            errors.append("At least one package is required")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    async def _create_packages(self, packages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create service packages"""
        packages = []
        
        for package_data in packages_data:
            package = {
                "id": str(uuid.uuid4()),
                "name": package_data["name"],
                "description": package_data["description"],
                "price": package_data["price"],
                "delivery_time": package_data["delivery_time"],
                "revisions": package_data.get("revisions", 1),
                "features": package_data.get("features", []),
                "extras": package_data.get("extras", [])
            }
            packages.append(package)
        
        return packages
    
    async def search_services(self, query: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Search for services"""
        try:
            filters = filters or {}
            
            # Filter services based on query and filters
            matching_services = []
            
            for service_id, service in self.services.items():
                if service["status"] != "active":
                    continue
                
                # Text search
                if query:
                    search_text = f"{service['title']} {service['description']} {' '.join(service['tags'])}".lower()
                    if query.lower() not in search_text:
                        continue
                
                # Category filter
                if filters.get("category") and service["category"] != filters["category"]:
                    continue
                
                # Price range filter
                if filters.get("min_price") or filters.get("max_price"):
                    min_price = min(pkg["price"] for pkg in service["packages"])
                    if filters.get("min_price") and min_price < filters["min_price"]:
                        continue
                    if filters.get("max_price") and min_price > filters["max_price"]:
                        continue
                
                # Delivery time filter
                if filters.get("delivery_time"):
                    min_delivery = min(pkg["delivery_time"] for pkg in service["packages"])
                    if min_delivery > filters["delivery_time"]:
                        continue
                
                # Rating filter
                if filters.get("min_rating") and service["rating"] < filters["min_rating"]:
                    continue
                
                matching_services.append(service)
            
            # Sort results
            sort_by = filters.get("sort_by", "relevance")
            if sort_by == "price_low":
                matching_services.sort(key=lambda s: min(pkg["price"] for pkg in s["packages"]))
            elif sort_by == "price_high":
                matching_services.sort(key=lambda s: min(pkg["price"] for pkg in s["packages"]), reverse=True)
            elif sort_by == "rating":
                matching_services.sort(key=lambda s: s["rating"], reverse=True)
            elif sort_by == "newest":
                matching_services.sort(key=lambda s: s["created_at"], reverse=True)
            
            return {
                "success": True,
                "query": query,
                "filters": filters,
                "total_results": len(matching_services),
                "services": matching_services[:20],  # Limit to 20 results
                "categories": list(self.categories.keys())
            }
            
        except Exception as e:
            return {"success": False, "error": f"Search failed: {str(e)}"}
    
    async def create_order(self, buyer_id: str, service_id: str, package_id: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new order"""
        try:
            if service_id not in self.services:
                return {"success": False, "error": "Service not found"}
            
            service = self.services[service_id]
            package = next((pkg for pkg in service["packages"] if pkg["id"] == package_id), None)
            
            if not package:
                return {"success": False, "error": "Package not found"}
            
            order_id = str(uuid.uuid4())
            
            order = {
                "id": order_id,
                "buyer_id": buyer_id,
                "seller_id": service["seller_id"],
                "service_id": service_id,
                "package_id": package_id,
                "package": package,
                "requirements": requirements,
                "status": "pending_payment",
                "total_amount": package["price"],
                "delivery_date": (datetime.now() + timedelta(days=package["delivery_time"])).isoformat(),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "messages": [],
                "deliverables": [],
                "revisions_used": 0,
                "revisions_allowed": package["revisions"]
            }
            
            # Store order
            self.orders[order_id] = order
            
            # Process payment
            payment_result = await self.payment_processor.process_payment(
                order_id, buyer_id, package["price"]
            )
            
            if payment_result["success"]:
                order["status"] = "in_progress"
                order["payment_id"] = payment_result["payment_id"]
                
                # Notify seller
                await self.messaging_system.send_notification(
                    service["seller_id"],
                    f"New order received for {service['title']}",
                    "order_received"
                )
            
            return {
                "success": True,
                "order_id": order_id,
                "order": order,
                "payment": payment_result
            }
            
        except Exception as e:
            return {"success": False, "error": f"Order creation failed: {str(e)}"}
    
    async def submit_delivery(self, seller_id: str, order_id: str, deliverables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Submit order delivery"""
        try:
            if order_id not in self.orders:
                return {"success": False, "error": "Order not found"}
            
            order = self.orders[order_id]
            
            if order["seller_id"] != seller_id:
                return {"success": False, "error": "Unauthorized"}
            
            if order["status"] != "in_progress":
                return {"success": False, "error": "Order not in progress"}
            
            # Add deliverables
            order["deliverables"].extend(deliverables)
            order["status"] = "delivered"
            order["delivered_at"] = datetime.now().isoformat()
            order["updated_at"] = datetime.now().isoformat()
            
            # Notify buyer
            await self.messaging_system.send_notification(
                order["buyer_id"],
                f"Your order has been delivered",
                "order_delivered"
            )
            
            return {
                "success": True,
                "order_id": order_id,
                "message": "Delivery submitted successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Delivery submission failed: {str(e)}"}
    
    async def submit_review(self, buyer_id: str, order_id: str, rating: int, comment: str) -> Dict[str, Any]:
        """Submit order review"""
        try:
            if order_id not in self.orders:
                return {"success": False, "error": "Order not found"}
            
            order = self.orders[order_id]
            
            if order["buyer_id"] != buyer_id:
                return {"success": False, "error": "Unauthorized"}
            
            if order["status"] != "delivered":
                return {"success": False, "error": "Order not delivered yet"}
            
            review_id = str(uuid.uuid4())
            
            review = {
                "id": review_id,
                "order_id": order_id,
                "service_id": order["service_id"],
                "buyer_id": buyer_id,
                "seller_id": order["seller_id"],
                "rating": rating,
                "comment": comment,
                "created_at": datetime.now().isoformat()
            }
            
            # Store review
            self.reviews[review_id] = review
            
            # Update service rating
            service = self.services[order["service_id"]]
            total_rating = service["rating"] * service["reviews_count"] + rating
            service["reviews_count"] += 1
            service["rating"] = total_rating / service["reviews_count"]
            
            # Complete order
            order["status"] = "completed"
            order["review_id"] = review_id
            order["updated_at"] = datetime.now().isoformat()
            
            # Release payment to seller
            await self.payment_processor.release_payment(order["payment_id"])
            
            return {
                "success": True,
                "review_id": review_id,
                "message": "Review submitted successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Review submission failed: {str(e)}"}
    
    async def get_seller_dashboard(self, seller_id: str) -> Dict[str, Any]:
        """Get seller dashboard data"""
        try:
            # Get seller services
            seller_services = [s for s in self.services.values() if s["seller_id"] == seller_id]
            
            # Get seller orders
            seller_orders = [o for o in self.orders.values() if o["seller_id"] == seller_id]
            
            # Calculate statistics
            total_earnings = sum(o["total_amount"] for o in seller_orders if o["status"] == "completed")
            active_orders = [o for o in seller_orders if o["status"] == "in_progress"]
            pending_orders = [o for o in seller_orders if o["status"] == "pending_payment"]
            
            # Get recent reviews
            seller_reviews = [r for r in self.reviews.values() if r["seller_id"] == seller_id]
            recent_reviews = sorted(seller_reviews, key=lambda r: r["created_at"], reverse=True)[:5]
            
            return {
                "success": True,
                "seller_id": seller_id,
                "statistics": {
                    "total_services": len(seller_services),
                    "active_orders": len(active_orders),
                    "pending_orders": len(pending_orders),
                    "total_earnings": total_earnings,
                    "average_rating": sum(s["rating"] for s in seller_services) / len(seller_services) if seller_services else 0,
                    "total_reviews": len(seller_reviews)
                },
                "services": seller_services,
                "active_orders": active_orders,
                "recent_reviews": recent_reviews
            }
            
        except Exception as e:
            return {"success": False, "error": f"Dashboard fetch failed: {str(e)}"}

class MarketplacePayments:
    """Marketplace payment processing"""
    
    async def process_payment(self, order_id: str, buyer_id: str, amount: float) -> Dict[str, Any]:
        """Process payment for order"""
        payment_id = str(uuid.uuid4())
        
        # Simulate payment processing
        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": order_id,
            "buyer_id": buyer_id,
            "amount": amount,
            "status": "held_in_escrow",
            "processed_at": datetime.now().isoformat()
        }
    
    async def release_payment(self, payment_id: str) -> Dict[str, Any]:
        """Release payment to seller"""
        return {
            "success": True,
            "payment_id": payment_id,
            "status": "released_to_seller",
            "released_at": datetime.now().isoformat()
        }

class MarketplaceMessaging:
    """Marketplace messaging system"""
    
    async def send_notification(self, user_id: str, message: str, notification_type: str) -> Dict[str, Any]:
        """Send notification to user"""
        return {
            "success": True,
            "user_id": user_id,
            "message": message,
            "type": notification_type,
            "sent_at": datetime.now().isoformat()
        }

# Global instance
marketplace_system = MarketplaceSystem()
