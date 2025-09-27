import { Ionicons } from '@expo/vector-icons';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import React, { useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface FireEffectProps {
  likes: number;
  size?: 'small' | 'medium' | 'large';
}

export default function FireEffect({ likes, size = 'medium' }: FireEffectProps) {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(0.8);
  const opacity2 = useSharedValue(0.6);
  const opacity3 = useSharedValue(0.4);
  const rotation = useSharedValue(0);

  const sizes = {
    small: { fire: 16, text: '$2', container: 24 },
    medium: { fire: 20, text: '$3', container: 28 },
    large: { fire: 24, text: '$4', container: 32 }
  };

  const currentSize = sizes[size];

  useEffect(() => {
    // Fire animation
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    scale2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1.15, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    scale3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Subtle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 1000 }),
        withTiming(-3, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { scale: scale1.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { scale: scale2.value },
      { rotate: `${rotation.value * 0.7}deg` }
    ],
    opacity: opacity2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [
      { scale: scale3.value },
      { rotate: `${rotation.value * 0.5}deg` }
    ],
    opacity: opacity3.value,
  }));

  return (
    <XStack
      alignItems="center"
      gap="$2"
      backgroundColor="rgba(255, 69, 0, 0.15)"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$6"
      borderWidth={1}
      borderColor="rgba(255, 69, 0, 0.3)"
    >
      {/* Fire Effect Stack */}
      <YStack
        position="relative"
        width={currentSize.container}
        height={currentSize.container}
        alignItems="center"
        justifyContent="center"
      >
        {/* Background fire */}
        <Animated.View
          style={[
            {
              position: 'absolute',
            },
            animatedStyle3,
          ]}
        >
          <Ionicons name="flame" size={currentSize.fire} color="#FF8C00" />
        </Animated.View>

        {/* Middle fire */}
        <Animated.View
          style={[
            {
              position: 'absolute',
            },
            animatedStyle2,
          ]}
        >
          <Ionicons name="flame" size={currentSize.fire} color="#FF6347" />
        </Animated.View>

        {/* Front fire */}
        <Animated.View style={animatedStyle1}>
          <Ionicons name="flame" size={currentSize.fire} color="#FF4500" />
        </Animated.View>
      </YStack>

      {/* Hot text and likes count */}
      <XStack alignItems="center" gap="$1">
        <Text
          fontSize={currentSize.text}
          fontWeight="bold"
          color="#FF4500"
        >
          HOT
        </Text>
        <Text
          fontSize={currentSize.text}
          fontWeight="600"
          color="#FF6347"
        >
          {likes}
        </Text>
      </XStack>
    </XStack>
  );
}
