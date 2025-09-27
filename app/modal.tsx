import { Ionicons } from "@expo/vector-icons";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { Text } from "@tamagui/core";
import { XStack, YStack } from "@tamagui/stacks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FireEffect from "@/src/components/FireEffect";
import { usePropertyStore } from "@/src/hooks/usePropertyStore";
import { Property } from "@/src/types/Property";
import { formatCurrency } from "@/src/utils/formatters";

const { width: screenWidth } = Dimensions.get("window");

// Add this function to determine if property is hot
const isHotProperty = (likes: number): boolean => {
  return likes >= 100; // Properties with 100+ likes are considered "hot"
};

export default function PropertyDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { properties, favorites, toggleFavorite } = usePropertyStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the property by ID
  const propertyId = params.id as string;
  const property = [...properties, ...favorites].find(p => p.id === propertyId);

  if (!property) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Imóvel não encontrado
          </Text>
          <Button onPress={() => router.back()}>
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = (property: Property) => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${
      property.location
    }. Valor: ${formatCurrency(property.price)}/mês`;
    const phone = property.agent.phone.replace(/\D/g, "");
    const url = `whatsapp://send?phone=55${phone}&text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp não encontrado",
          "Por favor, instale o WhatsApp para continuar."
        );
      }
    });
  };

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

  const isFavorited = favorites.some(fav => fav.id === property.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        padding="$4"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text fontSize="$5" fontWeight="bold" color="$color">
          Detalhes do Imóvel
        </Text>
        
        <TouchableOpacity onPress={() => toggleFavorite(property)}>
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorited ? "#e74c3c" : "#333"} 
          />
        </TouchableOpacity>
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <YStack position="relative">
          <Image
            source={{ uri: property.images[currentImageIndex] }}
            style={{
              width: screenWidth,
              height: 300,
              backgroundColor: "#f0f0f0",
            }}
            resizeMode="cover"
          />

          {/* Hot Property Badge */}
          {isHotProperty(property.likes) && (
            <YStack position="absolute" top={15} left={15}>
              <FireEffect likes={property.likes} size="medium" />
            </YStack>
          )}

          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <TouchableOpacity
                onPress={prevImage}
                style={{
                  position: "absolute",
                  left: 15,
                  top: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="chevron-back" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={nextImage}
                style={{
                  position: "absolute",
                  right: 15,
                  top: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>

              {/* Image Indicators */}
              <XStack
                position="absolute"
                bottom={15}
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
                      index === currentImageIndex
                        ? "white"
                        : "rgba(255,255,255,0.5)"
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
        <YStack padding="$4" gap="$4">
          {/* Title and Location */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack flex={1}>
                <Text fontSize="$7" fontWeight="bold" color="$color">
                  {property.title}
                </Text>
                <XStack alignItems="center" gap="$2" marginTop="$1">
                  <Ionicons name="location-outline" size={18} color="#666" />
                  <Text color="$gray10" fontSize="$4">
                    {property.location}
                  </Text>
                </XStack>
              </YStack>

              {/* Likes counter */}
              <XStack alignItems="center" gap="$1">
                <Ionicons
                  name={property.likes >= 100 ? "heart" : "heart-outline"}
                  size={18}
                  color={property.likes >= 100 ? "#FF4500" : "#666"}
                />
                <Text
                  color={property.likes >= 100 ? "#FF4500" : "$gray10"}
                  fontSize="$4"
                  fontWeight={property.likes >= 100 ? "bold" : "normal"}
                >
                  {property.likes}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Property Details */}
          <Card backgroundColor="$backgroundStrong" padding="$4" borderRadius="$4">
            <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$3">
              Características
            </Text>
            <XStack justifyContent="space-around" alignItems="center">
              <YStack alignItems="center" gap="$1">
                <Ionicons name="bed-outline" size={24} color="#666" />
                <Text color="$gray10" fontSize="$3">
                  {property.bedrooms} quartos
                </Text>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Ionicons name="water-outline" size={24} color="#666" />
                <Text color="$gray10" fontSize="$3">
                  {property.bathrooms} banheiros
                </Text>
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Ionicons name="resize-outline" size={24} color="#666" />
                <Text color="$gray10" fontSize="$3">
                  {property.area}m²
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Description */}
          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="600" color="$color">
              Descrição
            </Text>
            <Text fontSize="$4" color="$gray11" lineHeight="$1">
              {property.description}
            </Text>
          </YStack>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color="$color">
                Características
              </Text>
              <XStack flexWrap="wrap" gap="$2">
                {property.features.map((feature, index) => (
                  <YStack
                    key={index}
                    backgroundColor="$blue2"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                  >
                    <Text fontSize="$3" color="$blue11">
                      {feature}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          )}

          {/* Agent Info */}
          <Card backgroundColor="$backgroundStrong" padding="$4" borderRadius="$4">
            <Text fontSize="$5" fontWeight="600" color="$color" marginBottom="$3">
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
                        <Text color="white" fontSize="$3" fontWeight="bold">
                          {property.agent.rating.toFixed(1)}
                        </Text>
                      </YStack>
                    </XStack>
                  )}

                  <YStack flex={1}>
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      {property.agent.name}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {property.agent.company}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {property.agent.responseTime}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <YStack
        backgroundColor="$background"
        padding="$4"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button
          size="$5"
          backgroundColor={isHotProperty(property.likes) ? "$orange10" : "$green10"}
          color="white"
          borderRadius="$4"
          fontWeight="600"
          onPress={() => handleWhatsApp(property)}
          shadowColor={isHotProperty(property.likes) ? "#FF4500" : "transparent"}
          shadowOffset={{ width: 0, height: 0 }}
          shadowOpacity={0.5}
          shadowRadius={10}
          icon={
            isHotProperty(property.likes) ? (
              <Ionicons name="flame" size={20} color="white" />
            ) : (
              <Ionicons name="logo-whatsapp" size={20} color="white" />
            )
          }
        >
          {isHotProperty(property.likes) ? "Imóvel em Alta!" : "Falar no WhatsApp"}
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
