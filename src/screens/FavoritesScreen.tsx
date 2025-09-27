import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import React from 'react';
import { Alert, FlatList, Image, Linking, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePropertyStore } from '../hooks/usePropertyStore';
import { Property } from '../types/Property';
import { formatCurrency } from '../utils/formatters';

export default function FavoritesScreen() {
  const { favorites } = usePropertyStore();

  const handleWhatsApp = (property: Property) => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${property.location}. Valor: ${formatCurrency(property.price)}/mês`;
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

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <YStack
      backgroundColor="$background"
      borderRadius="$4"
      padding="$4"
      marginBottom="$3"
      borderWidth={1}
      borderColor="$borderColor"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
    >
      <XStack gap="$3">
        {/* Property Image */}
        <Image
          source={{ uri: item.images[0] }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 8,
            backgroundColor: '#f0f0f0',
          }}
          resizeMode="cover"
        />

        {/* Property Info */}
        <YStack flex={1} gap="$2">
          <Text fontSize="$5" fontWeight="bold" color="$color">
            {item.title}
          </Text>
          
          <XStack alignItems="center" gap="$1">
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text fontSize="$3" color="$gray10">
              {item.location}
            </Text>
          </XStack>

          <Text fontSize="$5" fontWeight="bold" color="$blue10">
            {formatCurrency(item.price)}/mês
          </Text>

          <XStack gap="$3">
            <XStack alignItems="center" gap="$1">
              <Ionicons name="bed-outline" size={14} color="#666" />
              <Text fontSize="$2" color="$gray10">
                {item.bedrooms}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$1">
              <Ionicons name="water-outline" size={14} color="#666" />
              <Text fontSize="$2" color="$gray10">
                {item.bathrooms}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$1">
              <Ionicons name="resize-outline" size={14} color="#666" />
              <Text fontSize="$2" color="$gray10">
                {item.area}m²
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Action Button */}
        <YStack justifyContent="center">
          <TouchableOpacity
            onPress={() => handleWhatsApp(item)}
            style={{
              backgroundColor: '#25D366',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
          </TouchableOpacity>
        </YStack>
      </XStack>
    </YStack>
  );

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* Header */}
        <XStack
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$3"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Favoritos
          </Text>
        </XStack>

        {/* Empty State */}
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          
          <Text fontSize="$6" fontWeight="bold" color="$color" textAlign="center">
            Nenhum favorito ainda
          </Text>
          
          <Text fontSize="$4" color="$gray10" textAlign="center">
            Quando você curtir um imóvel, ele aparecerá aqui para você acessar facilmente.
          </Text>

          <Button
            size="$4"
            backgroundColor="$blue10"
            color="white"
            borderRadius="$4"
            marginTop="$4"
          >
            Explorar Imóveis
          </Button>
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
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Favoritos
        </Text>
        
        <YStack
          backgroundColor="$red10"
          borderRadius="$6"
          paddingHorizontal="$3"
          paddingVertical="$1"
        >
          <Text color="white" fontSize="$3" fontWeight="bold">
            {favorites.length}
          </Text>
        </YStack>
      </XStack>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
