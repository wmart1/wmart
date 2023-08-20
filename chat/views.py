from rest_framework import status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from chat.models import Conversation, Message
from chat.serializers import ConversationSerializer, MessageSerializer
from home.utility import send_notification
from users.authentication import ExpiringTokenAuthentication


class ConversationViewSet(ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = Conversation.objects.all()

    def get_queryset(self):
        user = self.request.user
        conversations = self.filter_queryset(user.conversations.all())
        return conversations


class MessageViewSet(ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes  = [ExpiringTokenAuthentication]
    queryset = Message.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.request.user
        receiver = serializer.validated_data['receiver']
        if Conversation.objects.filter(users__in=[user, receiver]).exists():
            conversation = Conversation.objects.filter(users__in=[user, receiver]).last()
        else:
            conversation = Conversation.objects.create()
            conversation.users.set([user, receiver])
        send_notification(
            user=receiver,
            title="You've received a new message",
            content="You've received a new message",
            data=conversation.id,
            data_type='conversationId',
            mom=request.user
        )
        serializer.save(sender=self.request.user, conversation=conversation)
        conversation_serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(conversation_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def read(self, request):
        conversation_id = request.data.get('conversation', [])
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Invalid Conversation ID'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.received_messages.filter(conversation=conversation, unread=True).update(unread=False)
        conversation_serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(conversation_serializer.data, status=status.HTTP_200_OK)
