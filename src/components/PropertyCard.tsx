import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import React, { useState } from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { Property } from '../types/Property';
import { formatCurrency } from '../utils/formatters';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface PropertyCardProps {
  property: Property;
  onSwipeLeft?: (property: Property) => void;
  onSwipeRight?: (property: Property) => void;
  onPress?: (property: Property) => void;
}

export default function PropertyCard({ 
  property, 
  onSwipeLeft, 
  onSwipeRight, 
  onPress 
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleSwipeLeft = () => {
    onSwipeLeft?.(property);
  };

  const handleSwipeRight = () => {
    onSwipeRight?.(property);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth);
        runOnJS(handleSwipeLeft)();
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth);
        runOnJS(handleSwipeRight)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ width: CARD_WIDTH }, animatedStyle]}>
        <Card
          elevate
          size="$6"
          bordered
          backgroundColor="$background"
          borderRadius="$6"
          overflow="hidden"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={8}
        >
          {/* Image Section */}
          <YStack position="relative">
            <Image
              source={{ uri: property.images[currentImageIndex] }}
              style={{
                width: '100%',
                height: 300,
                backgroundColor: '#f0f0f0',
              }}
              resizeMode="cover"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={prevImage}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={nextImage}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                {/* Image Indicators */}
                <XStack
                  position="absolute"
                  bottom={10}
                  alignSelf="center"
                  gap="$2"
                >
                  {property.images.map((_, index) => (
                    <YStack
                      key={index}
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={
                        index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)'
                      }
                    />
                  ))}
                </XStack>
              </>
            )}

            {/* Price Badge */}
            <YStack
              position="absolute"
              top={15}
              right={15}
              backgroundColor="$blue10"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
            >
              <Text color="white" fontWeight="bold" fontSize="$5">
                {formatCurrency(property.price)}/mês
              </Text>
            </YStack>
          </YStack>

          {/* Content Section */}
          <YStack padding="$4" gap="$3">
            {/* Title and Location */}
            <YStack gap="$2">
              <Text fontSize="$6" fontWeight="bold" color="$color">
                {property.title}
              </Text>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text color="$gray10" fontSize="$4">
                  {property.location}
                </Text>
              </XStack>
            </YStack>

            {/* Property Details */}
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$4">
                <XStack alignItems="center" gap="$1">
                  <Ionicons name="bed-outline" size={16} color="#666" />
                  <Text color="$gray10" fontSize="$3">
                    {property.bedrooms}
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Ionicons name="water-outline" size={16} color="#666" />
                  <Text color="$gray10" fontSize="$3">
                    {property.bathrooms}
                  </Text>
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Ionicons name="resize-outline" size={16} color="#666" />
                  <Text color="$gray10" fontSize="$3">
                    {property.area}m²
                  </Text>
                </XStack>
              </XStack>
            </XStack>

            {/* Agent Info */}
            <Card
              backgroundColor="$backgroundStrong"
              padding="$3"
              borderRadius="$3"
            >
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Disponível com:
                </Text>
                
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1}>
                    <XStack alignItems="center" gap="$2">
                      {!property.agent.isOwner && property.agent.rating > 0 && (
                        <XStack alignItems="center" gap="$1">
                          <YStack
                            backgroundColor="$gray8"
                            borderRadius="$6"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                          >
                            <Text color="white" fontSize="$2" fontWeight="bold">
                              {property.agent.rating.toFixed(1)}
                            </Text>
                          </YStack>
                        </XStack>
                      )}
                      
                      <YStack flex={1}>
                        <Text fontSize="$4" fontWeight="600" color="$color">
                          {property.agent.name}
                        </Text>
                        <Text fontSize="$3" color="$gray10">
                          {property.agent.responseTime}
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </XStack>
              </YStack>
            </Card>

            {/* Action Button */}
            <Button
              size="$4"
              backgroundColor="$green10"
              color="white"
              borderRadius="$4"
              fontWeight="600"
              onPress={() => onPress?.(property)}
              icon={<Ionicons name="logo-whatsapp" size={20} color="white" />}
            >
              Falar no WhatsApp
            </Button>
          </YStack>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}
