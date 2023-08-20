from rest_framework import serializers

from chat.models import Message, Conversation
from users.serializers import UserProfileSerializer


class MessageSerializer(serializers.ModelSerializer):
    """
    A custom serializer for handling messages
    """

    class Meta:
        model = Message
        fields = '__all__'
        extra_kwargs = {'sender': {'required': False},
                        'conversation': {'required': False}}

    def create(self, validated_data):
        validated_data['unread'] = True
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """
    A custom serializer for handling conversations
    """
    users = UserProfileSerializer(many=True, required=False)
    messages = MessageSerializer(many=True, required=False)
    unread = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = '__all__'

    def get_unread(self, obj):
        user = self.context.get('request').user
        if user.received_messages.filter(conversation=obj, unread=True).exists():
            return True
        return False
