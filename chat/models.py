from django.contrib.gis.db import models

from users.models import User


class Conversation(models.Model):
    """
    Model representation of a conversation between 2 Users
    """
    users = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Message(models.Model):
    """
    Model representation of a message inside a conversation
    """
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.SET_NULL, null=True)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.SET_NULL, null=True)
    text = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='conversations/files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    unread = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']