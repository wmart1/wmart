from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chat.views import ConversationViewSet, MessageViewSet
from disputes.views import DisputeViewSet, ProblemViewSet

from home.api.v1.viewsets import (
    SignupViewSet,
    LoginViewSet,
)
from notifications.views import NotificationViewSet
from order.views import ItemViewSet, OrderViewSet
from payments.views import PaymentsViewSet
from services.views import ExtraServiceViewSet
from users.viewsets import UserViewSet
from reviews.views import CustomerReviewViewSet, ReviewViewSet

router = DefaultRouter()
router.register("signup", SignupViewSet, basename="signup")
router.register("login", LoginViewSet, basename="login")
router.register("users", UserViewSet, basename="users")
router.register("orders", OrderViewSet, basename="orders")
router.register("items", ItemViewSet, basename="items")
router.register("reviews", ReviewViewSet, basename="reviews")
router.register("customer-reviews", CustomerReviewViewSet, basename="customer_reviews")
router.register("messages", MessageViewSet, basename="messages")
router.register("chat", ConversationViewSet, basename="chat")
router.register("payments", PaymentsViewSet, basename="payments")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("disputes", DisputeViewSet, basename="disputes")
router.register("problems", ProblemViewSet, basename="problems")
router.register("extra-services", ExtraServiceViewSet, basename="extra_services")

urlpatterns = [
    path("", include(router.urls)),
]
