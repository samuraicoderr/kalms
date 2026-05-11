import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type { ChatConversation, ChatMessage } from "../types/wellness.types";

export class ChatService {
  static async activeConversation(): Promise<ChatConversation> {
    const res = await apiClient.post<ChatConversation>(
      BackendRoutes.wellness.activeChatConversation,
      {},
      { requiresAuth: true }
    );
    return res.data;
  }

  static async messages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(
      BackendRoutes.wellness.chatMessages(conversationId),
      { requiresAuth: true }
    );
    return res.data;
  }

  static async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    const res = await apiClient.post<ChatMessage>(
      BackendRoutes.wellness.sendChatMessage(conversationId),
      { content },
      { requiresAuth: true }
    );
    return res.data;
  }
}

export default ChatService;

