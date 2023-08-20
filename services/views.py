from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import ExtraService
from .serializers import ExtraServiceSerializer

from users.authentication import ExpiringTokenAuthentication


class ExtraServiceViewSet(ModelViewSet):
    serializer_class = ExtraServiceSerializer
    permission_classes = (AllowAny,)
    authentication_classes = [ExpiringTokenAuthentication]
    queryset = ExtraService.objects.all()
