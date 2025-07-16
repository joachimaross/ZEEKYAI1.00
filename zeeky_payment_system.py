"""
💳 ZEEKY PAYMENT SYSTEM
Advanced payment processing with subscriptions and billing
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid
import secrets

class PaymentProcessor:
    """Advanced Payment Processing System"""
    
    def __init__(self):
        self.payment_methods = {}
        self.subscriptions = {}
        self.transactions = {}
        self.plans = self._initialize_plans()
        self.payment_providers = self._initialize_providers()
        self.billing_engine = BillingEngine()
        self.subscription_manager = SubscriptionManager()
        
    def _initialize_plans(self):
        """Initialize subscription plans"""
        return {
            "free": {
                "id": "free",
                "name": "Free Plan",
                "price": 0.00,
                "currency": "USD",
                "interval": "month",
                "features": {
                    "ai_requests": 100,
                    "image_generations": 10,
                    "storage_gb": 1,
                    "support": "community",
                    "api_access": False,
                    "advanced_features": False
                },
                "limits": {
                    "daily_requests": 20,
                    "monthly_requests": 100,
                    "concurrent_sessions": 1
                }
            },
            "starter": {
                "id": "starter",
                "name": "Starter Plan",
                "price": 9.99,
                "currency": "USD",
                "interval": "month",
                "features": {
                    "ai_requests": 1000,
                    "image_generations": 100,
                    "storage_gb": 10,
                    "support": "email",
                    "api_access": True,
                    "advanced_features": False
                },
                "limits": {
                    "daily_requests": 100,
                    "monthly_requests": 1000,
                    "concurrent_sessions": 3
                }
            },
            "professional": {
                "id": "professional",
                "name": "Professional Plan",
                "price": 29.99,
                "currency": "USD",
                "interval": "month",
                "features": {
                    "ai_requests": 5000,
                    "image_generations": 500,
                    "storage_gb": 100,
                    "support": "priority",
                    "api_access": True,
                    "advanced_features": True
                },
                "limits": {
                    "daily_requests": 500,
                    "monthly_requests": 5000,
                    "concurrent_sessions": 10
                }
            },
            "enterprise": {
                "id": "enterprise",
                "name": "Enterprise Plan",
                "price": 99.99,
                "currency": "USD",
                "interval": "month",
                "features": {
                    "ai_requests": "unlimited",
                    "image_generations": "unlimited",
                    "storage_gb": 1000,
                    "support": "dedicated",
                    "api_access": True,
                    "advanced_features": True
                },
                "limits": {
                    "daily_requests": "unlimited",
                    "monthly_requests": "unlimited",
                    "concurrent_sessions": "unlimited"
                }
            }
        }
    
    def _initialize_providers(self):
        """Initialize payment providers"""
        return {
            "stripe": {
                "name": "Stripe",
                "public_key": "pk_test_stripe_key",
                "secret_key": "sk_test_stripe_key",
                "webhook_secret": "whsec_stripe_webhook",
                "supported_methods": ["card", "bank_transfer", "apple_pay", "google_pay"],
                "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"]
            },
            "paypal": {
                "name": "PayPal",
                "client_id": "paypal_client_id",
                "client_secret": "paypal_client_secret",
                "webhook_id": "paypal_webhook_id",
                "supported_methods": ["paypal", "card"],
                "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"]
            },
            "square": {
                "name": "Square",
                "application_id": "square_app_id",
                "access_token": "square_access_token",
                "webhook_signature_key": "square_webhook_key",
                "supported_methods": ["card", "cash_app"],
                "supported_currencies": ["USD", "CAD", "AUD", "GBP"]
            }
        }
    
    async def create_subscription(self, user_id: str, plan_id: str, payment_method_id: str) -> Dict[str, Any]:
        """Create new subscription"""
        try:
            if plan_id not in self.plans:
                return {"success": False, "error": "Invalid plan"}
            
            plan = self.plans[plan_id]
            
            # Skip payment for free plan
            if plan_id == "free":
                return await self._create_free_subscription(user_id, plan)
            
            # Validate payment method
            payment_method = self.payment_methods.get(payment_method_id)
            if not payment_method or payment_method["user_id"] != user_id:
                return {"success": False, "error": "Invalid payment method"}
            
            # Create subscription
            subscription_id = str(uuid.uuid4())
            
            # Process initial payment
            payment_result = await self._process_subscription_payment(
                subscription_id, user_id, plan, payment_method
            )
            
            if not payment_result["success"]:
                return payment_result
            
            # Create subscription record
            subscription = {
                "id": subscription_id,
                "user_id": user_id,
                "plan_id": plan_id,
                "plan": plan,
                "payment_method_id": payment_method_id,
                "status": "active",
                "current_period_start": datetime.now().isoformat(),
                "current_period_end": (datetime.now() + timedelta(days=30)).isoformat(),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "trial_end": None,
                "cancel_at_period_end": False,
                "canceled_at": None,
                "ended_at": None,
                "latest_invoice": payment_result["invoice_id"]
            }
            
            # Store subscription
            self.subscriptions[subscription_id] = subscription
            
            return {
                "success": True,
                "subscription_id": subscription_id,
                "subscription": subscription,
                "invoice": payment_result["invoice"]
            }
            
        except Exception as e:
            return {"success": False, "error": f"Subscription creation failed: {str(e)}"}
    
    async def _create_free_subscription(self, user_id: str, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Create free subscription"""
        subscription_id = str(uuid.uuid4())
        
        subscription = {
            "id": subscription_id,
            "user_id": user_id,
            "plan_id": "free",
            "plan": plan,
            "payment_method_id": None,
            "status": "active",
            "current_period_start": datetime.now().isoformat(),
            "current_period_end": (datetime.now() + timedelta(days=30)).isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "trial_end": None,
            "cancel_at_period_end": False,
            "canceled_at": None,
            "ended_at": None,
            "latest_invoice": None
        }
        
        self.subscriptions[subscription_id] = subscription
        
        return {
            "success": True,
            "subscription_id": subscription_id,
            "subscription": subscription
        }
    
    async def _process_subscription_payment(self, subscription_id: str, user_id: str, 
                                          plan: Dict[str, Any], payment_method: Dict[str, Any]) -> Dict[str, Any]:
        """Process subscription payment"""
        try:
            # Create invoice
            invoice_id = str(uuid.uuid4())
            
            invoice = {
                "id": invoice_id,
                "subscription_id": subscription_id,
                "user_id": user_id,
                "amount": plan["price"],
                "currency": plan["currency"],
                "description": f"{plan['name']} - Monthly Subscription",
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "due_date": datetime.now().isoformat(),
                "paid_at": None,
                "payment_method": payment_method["type"],
                "line_items": [
                    {
                        "description": plan["name"],
                        "amount": plan["price"],
                        "quantity": 1
                    }
                ]
            }
            
            # Process payment
            payment_result = await self._charge_payment_method(
                payment_method, plan["price"], plan["currency"], invoice_id
            )
            
            if payment_result["success"]:
                invoice["status"] = "paid"
                invoice["paid_at"] = datetime.now().isoformat()
                invoice["transaction_id"] = payment_result["transaction_id"]
                
                return {
                    "success": True,
                    "invoice_id": invoice_id,
                    "invoice": invoice,
                    "transaction": payment_result["transaction"]
                }
            else:
                invoice["status"] = "failed"
                return {"success": False, "error": payment_result["error"]}
                
        except Exception as e:
            return {"success": False, "error": f"Payment processing failed: {str(e)}"}
    
    async def _charge_payment_method(self, payment_method: Dict[str, Any], amount: float, 
                                   currency: str, invoice_id: str) -> Dict[str, Any]:
        """Charge payment method"""
        try:
            transaction_id = str(uuid.uuid4())
            
            # Simulate payment processing
            transaction = {
                "id": transaction_id,
                "amount": amount,
                "currency": currency,
                "payment_method": payment_method["type"],
                "status": "succeeded",
                "created_at": datetime.now().isoformat(),
                "invoice_id": invoice_id,
                "provider": payment_method.get("provider", "stripe"),
                "provider_transaction_id": f"txn_{secrets.token_hex(8)}"
            }
            
            # Store transaction
            self.transactions[transaction_id] = transaction
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "transaction": transaction
            }
            
        except Exception as e:
            return {"success": False, "error": f"Payment charge failed: {str(e)}"}
    
    async def add_payment_method(self, user_id: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add payment method for user"""
        try:
            payment_method_id = str(uuid.uuid4())
            
            payment_method = {
                "id": payment_method_id,
                "user_id": user_id,
                "type": payment_data["type"],  # card, bank_account, paypal, etc.
                "provider": payment_data.get("provider", "stripe"),
                "is_default": payment_data.get("is_default", False),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "status": "active"
            }
            
            # Add type-specific data
            if payment_data["type"] == "card":
                payment_method.update({
                    "card": {
                        "last4": payment_data["card"]["number"][-4:],
                        "brand": payment_data["card"]["brand"],
                        "exp_month": payment_data["card"]["exp_month"],
                        "exp_year": payment_data["card"]["exp_year"],
                        "fingerprint": secrets.token_hex(16)
                    }
                })
            elif payment_data["type"] == "bank_account":
                payment_method.update({
                    "bank_account": {
                        "last4": payment_data["bank_account"]["account_number"][-4:],
                        "bank_name": payment_data["bank_account"]["bank_name"],
                        "account_type": payment_data["bank_account"]["account_type"]
                    }
                })
            
            # Store payment method
            self.payment_methods[payment_method_id] = payment_method
            
            return {
                "success": True,
                "payment_method_id": payment_method_id,
                "payment_method": payment_method
            }
            
        except Exception as e:
            return {"success": False, "error": f"Payment method creation failed: {str(e)}"}
    
    async def cancel_subscription(self, subscription_id: str, user_id: str, 
                                immediate: bool = False) -> Dict[str, Any]:
        """Cancel subscription"""
        try:
            subscription = self.subscriptions.get(subscription_id)
            if not subscription or subscription["user_id"] != user_id:
                return {"success": False, "error": "Subscription not found"}
            
            if subscription["status"] != "active":
                return {"success": False, "error": "Subscription is not active"}
            
            if immediate:
                # Cancel immediately
                subscription["status"] = "canceled"
                subscription["canceled_at"] = datetime.now().isoformat()
                subscription["ended_at"] = datetime.now().isoformat()
            else:
                # Cancel at period end
                subscription["cancel_at_period_end"] = True
                subscription["canceled_at"] = datetime.now().isoformat()
            
            subscription["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "subscription": subscription,
                "message": "Subscription canceled successfully" if immediate else "Subscription will cancel at period end"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Subscription cancellation failed: {str(e)}"}
    
    async def get_user_billing_info(self, user_id: str) -> Dict[str, Any]:
        """Get user billing information"""
        try:
            # Get user subscriptions
            user_subscriptions = [s for s in self.subscriptions.values() if s["user_id"] == user_id]
            
            # Get payment methods
            user_payment_methods = [pm for pm in self.payment_methods.values() if pm["user_id"] == user_id]
            
            # Get recent transactions
            user_transactions = [t for t in self.transactions.values() 
                               if any(s["id"] in t.get("invoice_id", "") for s in user_subscriptions)]
            
            # Calculate usage and billing
            current_subscription = next((s for s in user_subscriptions if s["status"] == "active"), None)
            
            usage_info = await self._calculate_usage(user_id, current_subscription)
            
            return {
                "success": True,
                "user_id": user_id,
                "current_subscription": current_subscription,
                "subscriptions": user_subscriptions,
                "payment_methods": user_payment_methods,
                "recent_transactions": sorted(user_transactions, key=lambda t: t["created_at"], reverse=True)[:10],
                "usage": usage_info,
                "available_plans": list(self.plans.values())
            }
            
        except Exception as e:
            return {"success": False, "error": f"Billing info retrieval failed: {str(e)}"}
    
    async def _calculate_usage(self, user_id: str, subscription: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate user usage statistics"""
        if not subscription:
            return {"plan": "none", "usage": {}}
        
        plan = subscription["plan"]
        
        # Simulate usage calculation
        current_usage = {
            "ai_requests": {
                "used": 150,
                "limit": plan["features"]["ai_requests"],
                "percentage": 15.0 if plan["features"]["ai_requests"] != "unlimited" else 0
            },
            "image_generations": {
                "used": 25,
                "limit": plan["features"]["image_generations"],
                "percentage": 25.0 if plan["features"]["image_generations"] != "unlimited" else 0
            },
            "storage_gb": {
                "used": 2.5,
                "limit": plan["features"]["storage_gb"],
                "percentage": 2.5 if plan["features"]["storage_gb"] != "unlimited" else 0
            }
        }
        
        return {
            "plan": plan["name"],
            "billing_cycle": subscription["current_period_start"] + " to " + subscription["current_period_end"],
            "usage": current_usage,
            "overage_charges": 0.00
        }
    
    async def process_webhook(self, provider: str, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process payment provider webhook"""
        try:
            if provider not in self.payment_providers:
                return {"success": False, "error": "Unknown provider"}
            
            # Process different webhook events
            event_type = webhook_data.get("type", webhook_data.get("event_type"))
            
            if event_type in ["invoice.payment_succeeded", "payment.completed"]:
                return await self._handle_payment_success(webhook_data)
            elif event_type in ["invoice.payment_failed", "payment.failed"]:
                return await self._handle_payment_failure(webhook_data)
            elif event_type in ["customer.subscription.deleted", "subscription.cancelled"]:
                return await self._handle_subscription_cancellation(webhook_data)
            else:
                return {"success": True, "message": f"Webhook event {event_type} processed"}
                
        except Exception as e:
            return {"success": False, "error": f"Webhook processing failed: {str(e)}"}
    
    async def _handle_payment_success(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment webhook"""
        # Update subscription and invoice status
        return {"success": True, "message": "Payment success processed"}
    
    async def _handle_payment_failure(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment webhook"""
        # Update subscription status, send notifications
        return {"success": True, "message": "Payment failure processed"}
    
    async def _handle_subscription_cancellation(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription cancellation webhook"""
        # Update subscription status
        return {"success": True, "message": "Subscription cancellation processed"}

class BillingEngine:
    """Billing and invoicing engine"""
    
    async def generate_invoice(self, subscription_id: str) -> Dict[str, Any]:
        """Generate invoice for subscription"""
        invoice_id = str(uuid.uuid4())
        
        return {
            "id": invoice_id,
            "subscription_id": subscription_id,
            "status": "draft",
            "created_at": datetime.now().isoformat()
        }

class SubscriptionManager:
    """Subscription management"""
    
    async def check_subscription_renewals(self) -> List[Dict[str, Any]]:
        """Check for subscriptions that need renewal"""
        renewals = []
        
        for subscription in payment_processor.subscriptions.values():
            if subscription["status"] == "active":
                period_end = datetime.fromisoformat(subscription["current_period_end"])
                if period_end <= datetime.now():
                    renewals.append(subscription)
        
        return renewals
    
    async def process_renewal(self, subscription_id: str) -> Dict[str, Any]:
        """Process subscription renewal"""
        subscription = payment_processor.subscriptions.get(subscription_id)
        if not subscription:
            return {"success": False, "error": "Subscription not found"}
        
        # Process renewal payment and update subscription
        return {"success": True, "message": "Subscription renewed"}

# Global instance
payment_processor = PaymentProcessor()
