import { apiClient } from "../ApiClient";
import { BackendRoutes } from "../BackendRoutes";
import type { ChatConversation, ChatMessage, ChatTurnResponse } from "../types/wellness.types";

export class ChatService {
  static async activeConversation(): Promise<ChatConversation> {
    const res = await apiClient.post<ChatConversation>(
      BackendRoutes.wellness.activeChatConversation,
      {},
      { requiresAuth: true }
    );
    return res.data;
  }

  static async listConversations(): Promise<ChatConversation[]> {
    const res = await apiClient.get<ChatConversation[]>(
      BackendRoutes.wellness.chatConversations,
      { requiresAuth: true }
    );
    return res.data;
  }

  static async createConversation(firstMessage?: string): Promise<ChatConversation> {
    const res = await apiClient.post<ChatConversation>(
      BackendRoutes.wellness.chatConversations,
      firstMessage ? { first_message: firstMessage } : {},
      { requiresAuth: true }
    );
    return res.data;
  }

  static async renameConversation(conversationId: string, title: string): Promise<ChatConversation> {
    const res = await apiClient.post<ChatConversation>(
      BackendRoutes.wellness.renameChatConversation(conversationId),
      { title },
      { requiresAuth: true }
    );
    return res.data;
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete<void>(
      BackendRoutes.wellness.chatConversationDetail(conversationId),
      { requiresAuth: true }
    );
  }

  static async messages(conversationId: string): Promise<ChatMessage[]> {
    const res = await apiClient.get<ChatMessage[]>(
      BackendRoutes.wellness.chatMessages(conversationId),
      { requiresAuth: true }
    );
    return res.data;
  }

  static async sendMessage(conversationId: string, content: string): Promise<ChatTurnResponse> {
    const res = await apiClient.post<ChatTurnResponse>(
      BackendRoutes.wellness.sendChatMessage(conversationId),
      { content },
      { requiresAuth: true }
    );
    return res.data;
  }

  static async editMessage(conversationId: string, messageIndex: number, content: string): Promise<ChatTurnResponse> {
    const res = await apiClient.post<ChatTurnResponse>(
      BackendRoutes.wellness.editChatMessage(conversationId),
      { message_index: messageIndex, content },
      { requiresAuth: true }
    );
    return res.data;
  }

  static async regenerateMessage(conversationId: string, messageIndex: number): Promise<ChatTurnResponse> {
    const res = await apiClient.post<ChatTurnResponse>(
      BackendRoutes.wellness.regenerateChatMessage(conversationId),
      { message_index: messageIndex },
      { requiresAuth: true }
    );
    return res.data;
  }
}

export default ChatService;
