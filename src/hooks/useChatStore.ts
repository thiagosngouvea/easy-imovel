import { create } from 'zustand';
import { ChatConversation, ChatMessage, TypingIndicator } from '../types/Chat';

interface ChatStore {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  typingIndicators: TypingIndicator[];
  isLoading: boolean;
  
  // Actions
  setConversations: (conversations: ChatConversation[]) => void;
  addConversation: (conversation: ChatConversation) => void;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  updateTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (conversationId: string, userId: string) => void;
  getConversationByPropertyAndAgent: (propertyId: string, agentId: string) => ChatConversation | undefined;
  createConversation: (propertyId: string, agentId: string, agentName: string, agentCompany: string, propertyTitle: string, propertyImage: string, userId: string) => ChatConversation;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  typingIndicators: [],
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  addMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: message,
          updatedAt: new Date(),
          unreadCount: message.senderType === 'agent' ? conv.unreadCount + 1 : conv.unreadCount
        };
        return updatedConv;
      }
      return conv;
    }),
    activeConversation: state.activeConversation?.id === conversationId 
      ? {
          ...state.activeConversation,
          messages: [...state.activeConversation.messages, message],
          lastMessage: message,
          updatedAt: new Date()
        }
      : state.activeConversation
  })),

  markMessagesAsRead: (conversationId, userId) => set((state) => ({
    conversations: state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            isRead: msg.senderId === userId ? msg.isRead : true
          })),
          unreadCount: 0
        };
      }
      return conv;
    }),
    activeConversation: state.activeConversation?.id === conversationId
      ? {
          ...state.activeConversation,
          messages: state.activeConversation.messages.map(msg => ({
            ...msg,
            isRead: msg.senderId === userId ? msg.isRead : true
          })),
          unreadCount: 0
        }
      : state.activeConversation
  })),

  updateTypingIndicator: (indicator) => set((state) => ({
    typingIndicators: [
      ...state.typingIndicators.filter(t => 
        !(t.conversationId === indicator.conversationId && t.userId === indicator.userId)
      ),
      indicator
    ]
  })),

  removeTypingIndicator: (conversationId, userId) => set((state) => ({
    typingIndicators: state.typingIndicators.filter(t => 
      !(t.conversationId === conversationId && t.userId === userId)
    )
  })),

  getConversationByPropertyAndAgent: (propertyId, agentId) => {
    const state = get();
    return state.conversations.find(conv => 
      conv.propertyId === propertyId && conv.agentId === agentId
    );
  },

  createConversation: (propertyId, agentId, agentName, agentCompany, propertyTitle, propertyImage, userId) => {
    const newConversation: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      userId,
      agentId,
      agentName,
      agentCompany,
      propertyTitle,
      propertyImage,
      messages: [],
      unreadCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations]
    }));

    return newConversation;
  },

  setLoading: (loading) => set({ isLoading: loading })
}));
