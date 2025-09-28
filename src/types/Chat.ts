export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  senderType: 'user' | 'agent';
  senderName: string;
  isRead: boolean;
  messageType?: 'text' | 'image' | 'document';
  attachmentUrl?: string;
}

export interface ChatConversation {
  id: string;
  propertyId: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentCompany: string;
  agentProfileImage?: string;
  propertyTitle: string;
  propertyImage: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  profileImage?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
