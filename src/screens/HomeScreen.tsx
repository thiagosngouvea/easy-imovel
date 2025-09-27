import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Linking, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../components/Header';
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
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    loadProperties();
  }, []);

  const currentProperty = getCurrentProperty();
  const nextProperty = properties[currentIndex + 1] || null;
  const remainingCount = getRemainingCount();

  const handleLike = (property: Property) => {
    likeProperty(property);
  };

  const handleReject = (property: Property) => {
    rejectProperty(property);
  };

  const handleWhatsApp = (property: Property) => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${property.location}. Valor: R$ ${property.price}/mês`;
    const phone = property.agents[0].phone.replace(/\D/g, '');
    
    // Try WhatsApp URL scheme first
    const whatsappUrl = `whatsapp://send?phone=55${phone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        return Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp for iOS
        const webUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        return Linking.openURL(webUrl);
      }
    }).catch(() => {
      // Final fallback - open web WhatsApp
      const webUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se está instalado.');
      });
    });
  };

  const handlePropertyPress = (property: Property) => {
    router.push(`/modal?id=${property.id}`);
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
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Text fontSize="$6" color="$color">
            Carregando imóveis...
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center" paddingHorizontal="$6">
            Encontrando as melhores opções para você
          </Text>
        </YStack>
      </View>
    );
  }

  if (!currentProperty) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
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
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <Header
        title="Easy Imóveis"
        subtitle={`${remainingCount} imóveis restantes`}
        showFavoriteButton={true}
        showSettingsButton={true}
        onSettingsPress={() => setShowActions(!showActions)}
        onFavoritePress={() => {/* Navigate to favorites */}}
      />

      {/* Card Stack */}
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center" // Volta para center
        paddingHorizontal="$4"
        paddingVertical="$4"
      >
        {/* Next Property Card (Background) */}
        {nextProperty && (
          <PropertyCard
            property={nextProperty}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onPress={() => {}}
            isBackground={true}
            style={{
              position: 'absolute',
              zIndex: 1,
              opacity: 0.8,
              transform: [{ scale: 0.95 }]
            }}
          />
        )}

        {/* Current Property Card (Foreground) */}
        {currentProperty && (
          <PropertyCard
            property={currentProperty}
            onSwipeLeft={handleReject}
            onSwipeRight={handleLike}
            onPress={handlePropertyPress}
            isBackground={false}
            style={{
              zIndex: 2
            }}
          />
        )}
      </YStack>

      {/* Action Buttons */}
      {showActions && (
        <XStack
          position="absolute"
          bottom={-30} // Volta para a parte inferior
          left={0}
          right={0}
          zIndex={10} // Adiciona zIndex alto para ficar na frente de tudo
          justifyContent="center"
          alignItems="center"
          gap="$6"
          paddingHorizontal="$4"
          paddingBottom="$6"
          paddingTop="$3"
          backgroundColor="transparent"
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
      {/* <YStack
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
      </YStack> */}
    </View>
  );
}
