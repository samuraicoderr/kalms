from django.conf import settings
from django.db import models
from django.utils import timezone

from src.lib.utils.uuid7 import uuid7


class ConversationStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    ARCHIVED = "archived", "Archived"
    DELETED = "deleted", "Deleted"


class MessageRole(models.TextChoices):
    USER = "user", "User"
    ASSISTANT = "assistant", "Assistant"
    SYSTEM = "system", "System"


class ChatConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_conversations",
    )
    title = models.CharField(max_length=140, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=ConversationStatus.choices,
        default=ConversationStatus.ACTIVE,
        db_index=True,
    )
    metadata = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_message_at", "-started_at"]
        indexes = [
            models.Index(fields=["user", "status", "-last_message_at"]),
            models.Index(fields=["user", "-started_at"]),
        ]

    def touch(self):
        self.last_message_at = timezone.now()
        self.save(update_fields=["last_message_at", "updated_at"])

    def __str__(self):
        return f"{self.user_id}:{self.title or 'Conversation'}"


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    conversation = models.ForeignKey(
        ChatConversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    role = models.CharField(max_length=20, choices=MessageRole.choices, db_index=True)
    content = models.TextField()
    model_name = models.CharField(max_length=80, blank=True, default="")
    safety_flags = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    token_count = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["role", "-created_at"]),
        ]

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            ChatConversation.objects.filter(pk=self.conversation_id).update(
                last_message_at=self.created_at,
                updated_at=timezone.now(),
            )

    def __str__(self):
        return f"{self.conversation_id}:{self.role}:{self.created_at:%Y-%m-%d %H:%M}"
