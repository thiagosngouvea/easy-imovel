import { ChatConversation, ChatMessage } from '../types/Chat';

// Simulated API service for chat functionality
// In a real app, this would connect to your backend API

export class ChatService {
  private static instance: ChatService;
  private conversations: Map<string, ChatConversation> = new Map();
  private messageListeners: Map<string, (message: ChatMessage) => void> = new Map();

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Simulate sending a message
  async sendMessage(conversationId: string, text: string, senderId: string, senderType: 'user' | 'agent', senderName: string): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: new Date(),
      senderId,
      senderType,
      senderName,
      isRead: false,
      messageType: 'text'
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Notify listeners
    const listener = this.messageListeners.get(conversationId);
    if (listener) {
      listener(message);
    }

    // Simulate agent auto-response for demo purposes
    if (senderType === 'user') {
      setTimeout(() => {
        this.simulateAgentResponse(conversationId, senderName);
      }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
    }

    return message;
  }

  // Simulate agent responses
  private async simulateAgentResponse(conversationId: string, userName: string): Promise<void> {
    const responses = [
      `Olá ${userName}! Obrigado pelo interesse no imóvel. Estou aqui para ajudar!`,
      'Posso agendar uma visita para você. Qual seria o melhor horário?',
      'Este imóvel tem uma localização excelente e está em ótimas condições.',
      'Temos algumas opções de financiamento disponíveis. Gostaria de saber mais?',
      'Posso enviar mais fotos e informações detalhadas sobre o imóvel.',
      'Estou disponível para esclarecer qualquer dúvida que você tenha.',
      'Que tal marcarmos uma conversa por telefone para discutir os detalhes?'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const agentMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: randomResponse,
      timestamp: new Date(),
      senderId: 'agent_demo',
      senderType: 'agent',
      senderName: 'Corretor',
      isRead: false,
      messageType: 'text'
    };

    const listener = this.messageListeners.get(conversationId);
    if (listener) {
      listener(agentMessage);
    }
  }

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void): () => void {
    this.messageListeners.set(conversationId, callback);

    // Return unsubscribe function
    return () => {
      this.messageListeners.delete(conversationId);
    };
  }

  // Get conversation history (simulated)
  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty array for new conversations
    return [];
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real app, this would update the backend
    console.log(`Messages marked as read for conversation ${conversationId} by user ${userId}`);
  }

  // Simulate typing indicator
  async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    // In a real app, this would notify other participants via WebSocket
    console.log(`User ${userId} is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`);
  }
}

export const chatService = ChatService.getInstance();
