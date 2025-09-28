import { Ionicons } from "@expo/vector-icons";
import { Text } from "@tamagui/core";
import { Input } from "@tamagui/input";
import { XStack, YStack } from "@tamagui/stacks";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChatStore } from "../hooks/useChatStore";
import { chatService } from "../services/chatService";
import { ChatMessage } from "../types/Chat";
import { Agent, Property } from "../types/Property";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
  agent: Agent;
  userId: string;
  userName: string;
}

export default function ChatModal({
  visible,
  onClose,
  property,
  agent,
  userId,
  userName,
}: ChatModalProps) {
  const {
    activeConversation,
    setActiveConversation,
    addMessage,
    getConversationByPropertyAndAgent,
    createConversation,
    markMessagesAsRead,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Initialize or get existing conversation
  useEffect(() => {
    if (visible && property && agent) {
      let conversation = getConversationByPropertyAndAgent(property.id, agent.id);
      
      if (!conversation) {
        conversation = createConversation(
          property.id,
          agent.id,
          agent.name,
          agent.company,
          property.title,
          property.images[0],
          userId
        );
      }
      
      setActiveConversation(conversation);
      
      // Mark messages as read when opening chat
      if (conversation.unreadCount > 0) {
        markMessagesAsRead(conversation.id, userId);
      }
    }
  }, [visible, property, agent, userId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = chatService.subscribeToMessages(
      activeConversation.id,
      (message: ChatMessage) => {
        addMessage(activeConversation.id, message);
        
        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return unsubscribe;
  }, [activeConversation, addMessage]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation || isSending) return;

    const text = messageText.trim();
    setMessageText("");
    setIsSending(true);

    try {
      const message = await chatService.sendMessage(
        activeConversation.id,
        text,
        userId,
        'user',
        userName
      );

      addMessage(activeConversation.id, message);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a mensagem. Tente novamente.");
      setMessageText(text); // Restore message text
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderType === 'user';
    
    return (
      <YStack
        alignItems={isMyMessage ? "flex-end" : "flex-start"}
        marginBottom="$3"
        paddingHorizontal="$4"
      >
        <YStack
          backgroundColor={isMyMessage ? "$blue10" : "$backgroundStrong"}
          padding="$3"
          borderRadius="$4"
          maxWidth="80%"
          borderBottomRightRadius={isMyMessage ? "$1" : "$4"}
          borderBottomLeftRadius={isMyMessage ? "$4" : "$1"}
        >
          <Text
            color={isMyMessage ? "white" : "$color"}
            fontSize="$4"
            lineHeight="$1"
          >
            {item.text}
          </Text>
        </YStack>
        
        <XStack alignItems="center" gap="$1" marginTop="$1">
          <Text fontSize="$2" color="$gray10">
            {formatMessageTime(item.timestamp)}
          </Text>
          {isMyMessage && (
            <Ionicons
              name={item.isRead ? "checkmark-done" : "checkmark"}
              size={12}
              color={item.isRead ? "#4CAF50" : "#999"}
            />
          )}
        </XStack>
      </YStack>
    );
  };

  const handleClose = () => {
    setActiveConversation(null);
    setMessageText("");
    onClose();
  };

  if (!visible || !activeConversation) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$4"
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <YStack alignItems="center" flex={1} marginHorizontal="$3">
              <Text fontSize="$5" fontWeight="bold" color="$color">
                {agent.name}
              </Text>
              <Text fontSize="$3" color="$gray10">
                {agent.company}
              </Text>
            </YStack>
            
            <TouchableOpacity>
              <Ionicons name="call" size={24} color="#333" />
            </TouchableOpacity>
          </XStack>

          {/* Property Info Bar */}
          <XStack
            backgroundColor="$blue2"
            padding="$3"
            alignItems="center"
            gap="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Ionicons name="home" size={20} color="#0066CC" />
            <YStack flex={1}>
              <Text fontSize="$3" fontWeight="600" color="$blue11">
                {property.title}
              </Text>
              <Text fontSize="$2" color="$blue10">
                {property.location}
              </Text>
            </YStack>
          </XStack>

          {/* Messages List */}
          <YStack flex={1}>
            {activeConversation.messages.length === 0 ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                gap="$3"
                padding="$6"
              >
                <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                <Text fontSize="$5" fontWeight="600" color="$color" textAlign="center">
                  Inicie uma conversa
                </Text>
                <Text fontSize="$3" color="$gray10" textAlign="center">
                  Envie uma mensagem para {agent.name} sobre este imóvel
                </Text>
              </YStack>
            ) : (
              <FlatList
                ref={flatListRef}
                data={activeConversation.messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingVertical: 16,
                  flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }}
              />
            )}
          </YStack>

          {/* Message Input */}
          <XStack
            backgroundColor="$background"
            padding="$4"
            alignItems="flex-end"
            gap="$3"
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <YStack flex={1}>
              <Input
                placeholder="Digite sua mensagem..."
                value={messageText}
                onChangeText={(text: string) => setMessageText(text)}
                multiline
                maxLength={500}
                backgroundColor="$backgroundStrong"
                borderColor="$borderColor"
                borderRadius="$6"
                padding="$3"
                fontSize="$4"
                minHeight={44}
                maxHeight={120}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
            </YStack>
            
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              style={{
                backgroundColor: messageText.trim() && !isSending ? "#0066CC" : "#ccc",
                borderRadius: 22,
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSending ? (
                <Ionicons name="hourglass" size={20} color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </XStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
