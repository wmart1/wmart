from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from reviews.models import CustomerReview, Review
from reviews.serializers import CustomerReviewSerializer, ReviewSerializer

from users.authentication import ExpiringTokenAuthentication


class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = Review.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'service_provider__business_name', 'user']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CustomerReviewViewSet(ModelViewSet):
    serializer_class = CustomerReviewSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = CustomerReview.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'service_provider__business_name', 'user']

    def perform_create(self, serializer):
        serializer.save(service_provider=self.request.user.serviceprovider)
