import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../hooks/usePropertyStore';
import { Property } from '../types/Property';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    properties,
    currentIndex,
    favorites,
    isLoading,
    loadProperties,
    likeProperty,
    rejectProperty,
    resetStack,
    getCurrentProperty,
    getRemainingCount,
  } = usePropertyStore();

  const [showActions, setShowActions] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const currentProperty = getCurrentProperty();
  const remainingCount = getRemainingCount();

  const handleLike = (property: Property) => {
    likeProperty(property);
  };

  const handleReject = (property: Property) => {
    rejectProperty(property);
  };

  const handleWhatsApp = (property: Property) => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${property.location}. Valor: R$ ${property.price}/mês`;
    const phone = property.agent.phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=55${phone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp não encontrado', 'Por favor, instale o WhatsApp para continuar.');
      }
    });
  };

  const handleReset = () => {
    Alert.alert(
      'Reiniciar',
      'Deseja ver novos imóveis? Isso irá reiniciar sua busca.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: resetStack },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize="$6" color="$color">
            Carregando imóveis...
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center" paddingHorizontal="$6">
            Encontrando as melhores opções para você
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!currentProperty) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
          <Ionicons name="home-outline" size={80} color="#ccc" />
          
          <Text fontSize="$7" fontWeight="bold" color="$color" textAlign="center">
            Parabéns! 🎉
          </Text>
          
          <Text fontSize="$5" color="$color" textAlign="center">
            Você viu todos os imóveis disponíveis
          </Text>
          
          <Text fontSize="$4" color="$gray10" textAlign="center">
            {favorites.length > 0 
              ? `Você curtiu ${favorites.length} ${favorites.length === 1 ? 'imóvel' : 'imóveis'}!`
              : 'Que tal ajustar os filtros e tentar novamente?'
            }
          </Text>

          <YStack gap="$3" marginTop="$6" width="100%">
            <Button
              size="$5"
              backgroundColor="$blue10"
              color="white"
              onPress={handleReset}
              borderRadius="$4"
            >
              Ver Novos Imóveis
            </Button>
            
            {favorites.length > 0 && (
              <Button
                size="$4"
                variant="outlined"
                borderColor="$green10"
                color="$green10"
                borderRadius="$4"
              >
                Ver Favoritos ({favorites.length})
              </Button>
            )}
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$4"
        paddingVertical="$3"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <YStack>
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Easy Imóvel
          </Text>
          <Text fontSize="$3" color="$gray10">
            {remainingCount} imóveis restantes
          </Text>
        </YStack>

        <XStack gap="$3">
          <Button
            size="$3"
            variant="outlined"
            borderColor="$borderColor"
            color="$color"
            circular
            onPress={() => setShowActions(!showActions)}
          >
            <Ionicons name="settings-outline" size={18} />
          </Button>
          
          {favorites.length > 0 && (
            <Button
              size="$3"
              backgroundColor="$red10"
              color="white"
              circular
              position="relative"
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

      {/* Card Stack */}
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="$4"
        paddingVertical="$4"
      >
        <PropertyCard
          property={currentProperty}
          onSwipeLeft={handleReject}
          onSwipeRight={handleLike}
          onPress={handleWhatsApp}
        />
      </YStack>

      {/* Action Buttons */}
      {showActions && (
        <XStack
          justifyContent="center"
          alignItems="center"
          gap="$6"
          paddingHorizontal="$4"
          paddingBottom="$6"
          paddingTop="$3"
        >
          <Button
            size="$5"
            backgroundColor="$red10"
            color="white"
            circular
            onPress={() => handleReject(currentProperty)}
            pressStyle={{ scale: 0.95 }}
          >
            <Ionicons name="close" size={28} color="white" />
          </Button>

          <Button
            size="$4"
            backgroundColor="$blue10"
            color="white"
            circular
            onPress={() => handleWhatsApp(currentProperty)}
            pressStyle={{ scale: 0.95 }}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
          </Button>

          <Button
            size="$5"
            backgroundColor="$green10"
            color="white"
            circular
            onPress={() => handleLike(currentProperty)}
            pressStyle={{ scale: 0.95 }}
          >
            <Ionicons name="heart" size={28} color="white" />
          </Button>
        </XStack>
      )}

      {/* Swipe Instructions */}
      <YStack
        position="absolute"
        bottom={showActions ? 120 : 40}
        alignSelf="center"
        backgroundColor="rgba(0,0,0,0.7)"
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderRadius="$4"
        opacity={0.8}
      >
        <Text color="white" fontSize="$2" textAlign="center">
          ← Deslize para rejeitar • Deslize para curtir →
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
