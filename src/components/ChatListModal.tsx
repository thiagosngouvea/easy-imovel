import { Ionicons } from "@expo/vector-icons";
import { Text } from "@tamagui/core";
import { XStack, YStack } from "@tamagui/stacks";
import React from "react";
import {
    FlatList,
    Image,
    Modal,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChatStore } from "../hooks/useChatStore";
import { ChatConversation } from "../types/Chat";

interface ChatListModalProps {
  visible: boolean;
  onClose: () => void;
  onConversationSelect: (conversation: ChatConversation) => void;
}

export default function ChatListModal({
  visible,
  onClose,
  onConversationSelect,
}: ChatListModalProps) {
  const { conversations } = useChatStore();

  const formatLastMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Agora' : `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderConversationItem = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      onPress={() => {
        onConversationSelect(item);
        onClose();
      }}
    >
      <XStack
        backgroundColor="$background"
        padding="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        {/* Property Image */}
        <Image
          source={{ uri: item.propertyImage }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
          }}
          resizeMode="cover"
        />

        {/* Conversation Info */}
        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
                {item.agentName}
              </Text>
              <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                {item.agentCompany}
              </Text>
            </YStack>
            
            <XStack alignItems="center" gap="$2">
              {item.lastMessage && (
                <Text fontSize="$2" color="$gray10">
                  {formatLastMessageTime(item.lastMessage.timestamp)}
                </Text>
              )}
              {item.unreadCount > 0 && (
                <YStack
                  backgroundColor="$red10"
                  borderRadius="$6"
                  minWidth={20}
                  height={20}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal="$2"
                >
                  <Text color="white" fontSize="$2" fontWeight="bold">
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </YStack>
              )}
            </XStack>
          </XStack>

          <Text fontSize="$3" color="$gray11" numberOfLines={1} marginBottom="$1">
            {item.propertyTitle}
          </Text>

          {item.lastMessage && (
            <Text fontSize="$3" color="$gray10" numberOfLines={2}>
              {item.lastMessage.senderType === 'user' ? 'Você: ' : ''}
              {item.lastMessage.text}
            </Text>
          )}
        </YStack>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </XStack>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          padding="$4"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text fontSize="$5" fontWeight="bold" color="$color">
            Conversas
          </Text>
          
          <YStack width={24} /> {/* Spacer */}
        </XStack>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$4"
            padding="$6"
          >
            <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
            <Text fontSize="$6" fontWeight="bold" color="$color" textAlign="center">
              Nenhuma conversa ainda
            </Text>
            <Text fontSize="$4" color="$gray10" textAlign="center">
              Quando você iniciar uma conversa com um corretor, ela aparecerá aqui.
            </Text>
          </YStack>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
