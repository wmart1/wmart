from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from disputes.models import Dispute, Problem
from disputes.serializers import DisputeSerializer, ProblemSerializer
from django_filters.rest_framework import DjangoFilterBackend

from users.authentication import ExpiringTokenAuthentication


class DisputeViewSet(ModelViewSet):
    serializer_class = DisputeSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes = [ExpiringTokenAuthentication]
    queryset = Dispute.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            return qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProblemViewSet(ModelViewSet):
    serializer_class = ProblemSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes = [ExpiringTokenAuthentication]
    queryset = Problem.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            return qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
