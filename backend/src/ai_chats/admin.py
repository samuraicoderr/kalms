from django.contrib import admin

from .models import ChatConversation, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ("id", "created_at")
    fields = ("id", "message_index", "role", "content", "model_name", "created_at")


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "status", "last_message_at", "started_at")
    list_filter = ("status", "started_at", "last_message_at")
    search_fields = ("user__email", "user__username", "title")
    readonly_fields = ("id", "started_at", "last_message_at", "updated_at")
    inlines = (ChatMessageInline,)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "user", "message_index", "role", "model_name", "created_at")
    list_filter = ("role", "model_name", "created_at")
    search_fields = ("user__email", "content")
    readonly_fields = ("id", "created_at")
