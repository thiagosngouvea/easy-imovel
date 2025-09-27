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
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // Find the property by ID
  const propertyId = params.id as string;
  const property = [...properties, ...favorites].find(p => p.id === propertyId);

  // Set default selected agent (prefer premium agents)
  React.useEffect(() => {
    if (property?.agents && property.agents.length > 0) {
      // First try to find a premium agent
      const premiumAgent = property.agents.find(agent => agent.isPremium);
      if (premiumAgent) {
        setSelectedAgentId(premiumAgent.id);
      } else {
        // Otherwise, select the first agent
        setSelectedAgentId(property.agents[0].id);
      }
    }
  }, [property]);

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

  const selectedAgent = property.agents.find(agent => agent.id === selectedAgentId) || property.agents[0];

  const handleWhatsApp = (agent: typeof selectedAgent) => {
    if (!agent) return;
    
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${
      property.location
    }. Valor: ${formatCurrency(property.price)}/mês`;
    const phone = agent.phone.replace(/\D/g, "");
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

          {/* Agent Selection */}
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="600" color="$color">
              Disponível com:
            </Text>

            {/* Agent Selector */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }} // Adiciona padding para o badge
            >
              <XStack gap="$3" paddingHorizontal="$1">
                {property.agents.map((agent) => (
                  <TouchableOpacity
                    key={agent.id}
                    onPress={() => setSelectedAgentId(agent.id)}
                    style={{ overflow: 'visible' }} // Permite overflow no TouchableOpacity também
                  >
                    <Card
                      backgroundColor={selectedAgentId === agent.id ? "$blue2" : "$backgroundStrong"}
                      borderColor={selectedAgentId === agent.id ? "$blue8" : "$borderColor"}
                      borderWidth={selectedAgentId === agent.id ? 2 : 1}
                      padding="$3"
                      borderRadius="$4"
                      minWidth={200}
                      position="relative"
                      overflow="visible" // Permite que o badge apareça fora do card
                      marginTop="$3" // Adiciona espaço no topo para o badge
                      marginRight="$2" // Adiciona espaço na direita para o badge
                    >
                      {/* Premium Badge */}
                      {agent.isPremium && (
                        <YStack
                          position="absolute"
                          top={-12} // Aumenta a distância do topo
                          right={-12} // Aumenta a distância da direita
                          backgroundColor="$orange10"
                          borderRadius="$6"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          zIndex={999} // zIndex muito alto
                          elevation={10} // Para Android
                          shadowColor="$shadowColor" // Adiciona sombra para destacar
                          shadowOffset={{ width: 0, height: 2 }}
                          shadowOpacity={0.3}
                          shadowRadius={4}
                        >
                          <XStack alignItems="center" gap="$1">
                            <Ionicons name="star" size={12} color="white" />
                            <Text color="white" fontSize="$1" fontWeight="bold">
                              PREMIUM
                            </Text>
                          </XStack>
                        </YStack>
                      )}

                      <YStack gap="$2">
                        <XStack justifyContent="space-between" alignItems="flex-start">
                          <YStack flex={1}>
                            <Text 
                              fontSize="$4" 
                              fontWeight="bold" 
                              color={selectedAgentId === agent.id ? "$blue11" : "$color"}
                            >
                              {agent.name}
                            </Text>
                            <Text fontSize="$2" color="$gray10">
                              {agent.company}
                            </Text>
                          </YStack>

                          {!agent.isOwner && agent.rating > 0 && (
                            <YStack
                              backgroundColor={agent.isPremium ? "$orange10" : "$gray8"}
                              borderRadius="$6"
                              paddingHorizontal="$2"
                              paddingVertical="$1"
                            >
                              <Text color="white" fontSize="$2" fontWeight="bold">
                                {agent.rating.toFixed(1)}
                              </Text>
                            </YStack>
                          )}
                        </XStack>

                        <Text fontSize="$2" color="$gray10">
                          Responde {agent.responseTime}
                        </Text>

                        {agent.experience && (
                          <Text fontSize="$2" color="$gray10">
                            {agent.experience} de experiência
                          </Text>
                        )}

                        {agent.specialties && agent.specialties.length > 0 && (
                          <XStack flexWrap="wrap" gap="$1">
                            {agent.specialties.slice(0, 2).map((specialty, index) => (
                              <YStack
                                key={index}
                                backgroundColor={agent.isPremium ? "$orange2" : "$gray2"}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                              >
                                <Text 
                                  fontSize="$1" 
                                  color={agent.isPremium ? "$orange11" : "$gray11"}
                                >
                                  {specialty}
                                </Text>
                              </YStack>
                            ))}
                          </XStack>
                        )}
                      </YStack>
                    </Card>
                  </TouchableOpacity>
                ))}
              </XStack>
            </ScrollView>

            {/* Selected Agent Details */}
            {selectedAgent && (
              <Card 
                backgroundColor="$backgroundStrong" 
                padding="$4" 
                borderRadius="$4"
                borderColor={selectedAgent.isPremium ? "$orange8" : "$borderColor"}
                borderWidth={selectedAgent.isPremium ? 2 : 1}
              >
                <YStack gap="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      Corretor Selecionado
                    </Text>
                    {selectedAgent.isPremium && (
                      <XStack alignItems="center" gap="$1">
                        <Ionicons name="star" size={16} color="#FF8C00" />
                        <Text color="$orange11" fontSize="$3" fontWeight="bold">
                          PREMIUM
                        </Text>
                      </XStack>
                    )}
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        {selectedAgent.name}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        {selectedAgent.company}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        Responde {selectedAgent.responseTime}
                      </Text>
                      {selectedAgent.experience && (
                        <Text fontSize="$3" color="$gray10">
                          {selectedAgent.experience} de experiência
                        </Text>
                      )}
                    </YStack>

                    {!selectedAgent.isOwner && selectedAgent.rating > 0 && (
                      <YStack
                        backgroundColor={selectedAgent.isPremium ? "$orange10" : "$gray8"}
                        borderRadius="$6"
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                      >
                        <Text color="white" fontSize="$4" fontWeight="bold">
                          {selectedAgent.rating.toFixed(1)}
                        </Text>
                      </YStack>
                    )}
                  </XStack>

                  {selectedAgent.specialties && selectedAgent.specialties.length > 0 && (
                    <YStack gap="$2">
                      <Text fontSize="$4" fontWeight="600" color="$color">
                        Especialidades
                      </Text>
                      <XStack flexWrap="wrap" gap="$2">
                        {selectedAgent.specialties.map((specialty, index) => (
                          <YStack
                            key={index}
                            backgroundColor={selectedAgent.isPremium ? "$orange2" : "$blue2"}
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius="$3"
                          >
                            <Text 
                              fontSize="$3" 
                              color={selectedAgent.isPremium ? "$orange11" : "$blue11"}
                            >
                              {specialty}
                            </Text>
                          </YStack>
                        ))}
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              </Card>
            )}
          </YStack>
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
          backgroundColor={
            selectedAgent?.isPremium 
              ? "$orange10" 
              : isHotProperty(property.likes) 
                ? "$orange10" 
                : "$green10"
          }
          color="white"
          borderRadius="$4"
          fontWeight="600"
          onPress={() => handleWhatsApp(selectedAgent)}
          shadowColor={
            selectedAgent?.isPremium || isHotProperty(property.likes) 
              ? "#FF4500" 
              : "transparent"
          }
          shadowOffset={{ width: 0, height: 0 }}
          shadowOpacity={0.5}
          shadowRadius={10}
          icon={
            selectedAgent?.isPremium ? (
              <Ionicons name="star" size={20} color="white" />
            ) : isHotProperty(property.likes) ? (
              <Ionicons name="flame" size={20} color="white" />
            ) : (
              <Ionicons name="logo-whatsapp" size={20} color="white" />
            )
          }
        >
          {selectedAgent?.isPremium 
            ? `Falar com ${selectedAgent.name} (Premium)` 
            : isHotProperty(property.likes) 
              ? "Imóvel em Alta!" 
              : "Falar no WhatsApp"
          }
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
