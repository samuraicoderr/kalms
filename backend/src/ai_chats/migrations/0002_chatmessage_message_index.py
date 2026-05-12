from django.db import migrations, models


def backfill_message_indexes(apps, schema_editor):
    ChatMessage = apps.get_model("ai_chats", "ChatMessage")
    conversation_ids = (
        ChatMessage.objects.order_by()
        .values_list("conversation_id", flat=True)
        .distinct()
    )
    for conversation_id in conversation_ids:
        messages = ChatMessage.objects.filter(conversation_id=conversation_id).order_by("created_at", "id")
        for index, message in enumerate(messages):
            ChatMessage.objects.filter(pk=message.pk).update(message_index=index)


class Migration(migrations.Migration):

    dependencies = [
        ("ai_chats", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatmessage",
            name="message_index",
            field=models.PositiveIntegerField(db_index=True, default=0),
        ),
        migrations.RunPython(backfill_message_indexes, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="chatmessage",
            constraint=models.UniqueConstraint(
                fields=("conversation", "message_index"),
                name="unique_chat_message_index_per_conversation",
            ),
        ),
        migrations.RemoveIndex(
            model_name="chatmessage",
            name="ai_chats_ch_convers_efc19d_idx",
        ),
        migrations.AddIndex(
            model_name="chatmessage",
            index=models.Index(
                fields=["conversation", "message_index"],
                name="ai_chats_ch_convers_a3ad49_idx",
            ),
        ),
    ]
