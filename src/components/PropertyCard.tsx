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
import FireEffect from './FireEffect';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface PropertyCardProps {
  property: Property;
  onSwipeLeft?: (property: Property) => void;
  onSwipeRight?: (property: Property) => void;
  onPress?: (property: Property) => void;
  isBackground?: boolean;
  style?: any; // Adiciona prop style
}

// Add this function to determine if property is hot
const isHotProperty = (likes: number): boolean => {
  return likes >= 100; // Properties with 100+ likes are considered "hot"
};

export default function PropertyCard({ 
  property, 
  onSwipeLeft, 
  onSwipeRight, 
  onPress,
  isBackground = false,
  style
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleSwipeLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onSwipeLeft?.(property);
  };

  const handleSwipeRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    onSwipeRight?.(property);
  };

  const panGesture = Gesture.Pan()
    .enabled(!isBackground && !isAnimating)
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
      
      // Update opacity based on swipe distance
      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      opacity.value = Math.max(0.3, 1 - progress * 0.7);
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth * 1.5, {
          damping: 15,
          stiffness: 150,
        });
        opacity.value = withSpring(0);
        runOnJS(handleSwipeLeft)();
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth * 1.5, {
          damping: 15,
          stiffness: 150,
        });
        opacity.value = withSpring(0);
        runOnJS(handleSwipeRight)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
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
      opacity: opacity.value,
    };
  });

  // Reset animation values when property changes
  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    setIsAnimating(false);
    setCurrentImageIndex(0);
  }, [property.id]);

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
      <Animated.View style={[{ width: CARD_WIDTH }, animatedStyle, style]}>
        <Card
          elevate
          size="$6"
          bordered
          backgroundColor="$background"
          borderRadius="$6"
          overflow="hidden"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={isBackground ? 0.05 : 0.1}
          shadowRadius={8}
          opacity={isBackground ? 0.8 : 1}
          // Add fire glow effect for hot properties
          borderColor={isHotProperty(property.likes) ? "rgba(255, 69, 0, 0.3)" : "$borderColor"}
          borderWidth={isHotProperty(property.likes) ? 2 : 1}
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
              
              {/* Hot Property Badge */}
              {isHotProperty(property.likes) && (
                <YStack
                  position="absolute"
                  top={15}
                  left={15}
                >
                  <FireEffect likes={property.likes} size="medium" />
                </YStack>
              )}

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
                backgroundColor={isHotProperty(property.likes) ? "$orange10" : "$blue10"}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                // Add subtle glow for hot properties
                shadowColor={isHotProperty(property.likes) ? "#FF4500" : "transparent"}
                shadowOffset={{ width: 0, height: 0 }}
                shadowOpacity={0.6}
                shadowRadius={8}
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
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1}>
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
                  
                  {/* Likes counter */}
                  <XStack alignItems="center" gap="$1">
                    <Ionicons 
                      name={property.likes >= 100 ? "heart" : "heart-outline"} 
                      size={16} 
                      color={property.likes >= 100 ? "#FF4500" : "#666"} 
                    />
                    <Text 
                      color={property.likes >= 100 ? "#FF4500" : "$gray10"} 
                      fontSize="$3"
                      fontWeight={property.likes >= 100 ? "bold" : "normal"}
                    >
                      {property.likes}
                    </Text>
                  </XStack>
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
                backgroundColor={isHotProperty(property.likes) ? "$orange10" : "$green10"}
                color="white"
                borderRadius="$4"
                fontWeight="600"
                onPress={() => onPress?.(property)}
                // Add glow effect for hot properties
                shadowColor={isHotProperty(property.likes) ? "#FF4500" : "transparent"}
                shadowOffset={{ width: 0, height: 0 }}
                shadowOpacity={0.5}
                shadowRadius={10}
                icon={
                  isHotProperty(property.likes) ? 
                    <Ionicons name="flame" size={20} color="white" /> :
                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                }
              >
                {isHotProperty(property.likes) ? 'Imóvel em Alta!' : 'Falar no WhatsApp'}
              </Button>
            </YStack>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}
