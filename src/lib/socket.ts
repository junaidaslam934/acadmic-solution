import { Message, Conversation } from '@/types/chat';

class ChatService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private listeners: {
    onMessageReceived?: (message: Message) => void;
    onConversationUpdated?: (conversation: Conversation) => void;
    onError?: (error: { message: string }) => void;
  } = {};

  // Simulate real-time updates with polling
  startPolling(conversationId: string, userId: string, userRole: 'student' | 'teacher') {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Poll for new messages every 2 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForUpdates(conversationId, userId, userRole);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async checkForUpdates(conversationId: string, userId: string, userRole: 'student' | 'teacher') {
    // This is a simplified polling approach
    // In a real implementation, you'd track the last message timestamp
    // and only fetch newer messages
  }

  // Message operations
  async sendMessage(data: {
    conversationId: string;
    text: string;
    senderId: string;
    senderRole: 'student' | 'teacher';
  }) {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success && this.listeners.onMessageReceived) {
        this.listeners.onMessageReceived(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      if (this.listeners.onError) {
        this.listeners.onError({ message: 'Failed to send message' });
      }
    }
  }

  // Read status
  async markAsRead(conversationId: string, userId: string, userRole: 'student' | 'teacher') {
    try {
      // Mark messages as read via API
      const messages = await fetch(`/api/chat/messages?conversationId=${conversationId}&userId=${userId}`);
      const data = await messages.json();
      
      if (data.success && data.messages) {
        // Mark unread messages as read
        for (const message of data.messages) {
          if (message.senderId !== userId && !message.readBy.some((read: any) => read.userId === userId)) {
            await fetch(`/api/chat/messages/${message._id}/read`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, userRole })
            });
          }
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Event listeners (simplified)
  onMessageReceived(callback: (message: Message) => void) {
    this.listeners.onMessageReceived = callback;
  }

  onConversationUpdated(callback: (conversation: Conversation) => void) {
    this.listeners.onConversationUpdated = callback;
  }

  onError(callback: (error: { message: string }) => void) {
    this.listeners.onError = callback;
  }

  // Typing indicators (simplified - just local state)
  startTyping(conversationId: string, userId: string, userName: string) {
    // In a real implementation, this would send to other users
    console.log(`${userName} started typing in ${conversationId}`);
  }

  stopTyping(conversationId: string, userId: string) {
    console.log(`User ${userId} stopped typing in ${conversationId}`);
  }

  // Simplified event handlers (no-op for compatibility)
  onUserTyping(callback: (data: any) => void) {
    // No-op for now
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    // No-op for now
  }

  onMessagesRead(callback: (data: any) => void) {
    // No-op for now
  }

  removeAllListeners() {
    this.listeners = {};
  }

  // Connection status (always true for HTTP)
  isConnected(): boolean {
    return true;
  }

  // Compatibility methods
  connect(userId: string, userRole: 'student' | 'teacher'): Promise<any> {
    return Promise.resolve({ connected: true });
  }

  disconnect() {
    this.stopPolling();
  }

  joinConversation(conversationId: string) {
    // No-op for HTTP approach
  }

  leaveConversation(conversationId: string) {
    // No-op for HTTP approach
  }
}

// Export singleton instance
export const socketService = new ChatService();
export default socketService;