import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChatStore } from '../hooks/useChatStore';
import { usePropertyStore } from '../hooks/usePropertyStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showFavoriteButton?: boolean;
  showSettingsButton?: boolean;
  showFilterButton?: boolean;
  showChatButton?: boolean;
  onSettingsPress?: () => void;
  onFavoritePress?: () => void;
  onFilterPress?: () => void;
  onChatPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export default function Header({
  title,
  subtitle,
  showFavoriteButton = false,
  showSettingsButton = false,
  showFilterButton = false,
  showChatButton = false,
  onSettingsPress,
  onFavoritePress,
  onFilterPress,
  onChatPress,
  backgroundColor = '$orange9',
  textColor = 'white'
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { favorites } = usePropertyStore();
  const { conversations } = useChatStore();

  // Get unread messages count
  const unreadMessagesCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      paddingHorizontal="$4"
      paddingVertical="$3"
      paddingTop={insets.top + 12}
      backgroundColor={backgroundColor}
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      {/* Left side - Filter button */}
      <XStack alignItems="center">
        {showFilterButton && (
          <Button
            size="$3"
            variant="outlined"
            borderColor="rgba(255,255,255,0.3)"
            color={textColor}
            circular
            onPress={onFilterPress}
          >
            <Ionicons name="options-outline" size={18} />
          </Button>
        )}
      </XStack>

      {/* Center - Title */}
      <YStack alignItems="center">
        <Text fontSize="$6" fontWeight="bold" color={textColor}>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="$3" color={textColor}>
            {subtitle}
          </Text>
        )}
      </YStack>

      {/* Right side - Chat, Settings and Favorites */}
      <XStack gap="$3">
        {showChatButton && (
          <Button
            size="$3"
            variant="outlined"
            borderColor="rgba(255,255,255,0.3)"
            color={textColor}
            circular
            position="relative"
            onPress={onChatPress}
          >
            <Ionicons name="chatbubbles-outline" size={18} />
            {unreadMessagesCount > 0 && (
              <YStack
                position="absolute"
                top={-5}
                right={-5}
                backgroundColor="$red10"
                borderRadius="$6"
                minWidth={18}
                height={18}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$1"
              >
                <Text color="white" fontSize="$1" fontWeight="bold">
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Text>
              </YStack>
            )}
          </Button>
        )}

        {showSettingsButton && (
          <Button
            size="$3"
            variant="outlined"
            borderColor="rgba(255,255,255,0.3)"
            color={textColor}
            circular
            onPress={onSettingsPress}
          >
            <Ionicons name="settings-outline" size={18} />
          </Button>
        )}
        
        {showFavoriteButton && favorites.length > 0 && (
          <Button
            size="$3"
            backgroundColor="$red10"
            color="white"
            circular
            position="relative"
            onPress={onFavoritePress}
          >
            <Ionicons name="heart" size={18} />
            <YStack
              position="absolute"
              top={-5}
              right={-5}
              backgroundColor="$orange10"
              borderRadius="$6"
              minWidth={20}
              height={20}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontSize="$1" fontWeight="bold">
                {favorites.length}
              </Text>
            </YStack>
          </Button>
        )}
      </XStack>
    </XStack>
  );
}
