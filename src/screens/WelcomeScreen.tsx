import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
        
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$6"
          paddingVertical="$8"
        >
          {/* Logo e Título */}
          <YStack alignItems="center" gap="$4" marginTop="$10">
            <YStack
              backgroundColor="rgba(255,255,255,0.2)"
              borderRadius="$10"
              padding="$6"
            >
              <Ionicons name="home" size={80} color="white" />
            </YStack>
            
            <Text
              fontSize="$10"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
              Easy Imóveis
            </Text>
            
            <Text
              fontSize="$5"
              color="rgba(255,255,255,0.9)"
              textAlign="center"
              lineHeight="$6"
            >
              Encontre o imóvel dos seus sonhos{'\n'}de forma simples e rápida
            </Text>
          </YStack>

          {/* Features */}
          <YStack gap="$4" width="100%">
            <XStack alignItems="center" gap="$3">
              <Ionicons name="heart" size={24} color="white" />
              <Text color="white" fontSize="$4">
                Deslize para curtir ou rejeitar
              </Text>
            </XStack>
            
            <XStack alignItems="center" gap="$3">
              <Ionicons name="chatbubble" size={24} color="white" />
              <Text color="white" fontSize="$4">
                Contato direto via WhatsApp
              </Text>
            </XStack>
            
            <XStack alignItems="center" gap="$3">
              <Ionicons name="location" size={24} color="white" />
              <Text color="white" fontSize="$4">
                Imóveis na sua região
              </Text>
            </XStack>
          </YStack>

          {/* Botões */}
          <YStack gap="$3" width="100%">
            <Button
              size="$5"
              backgroundColor="white"
              color="$orange9"
              borderRadius="$6"
              fontWeight="600"
              onPress={() => router.push('/login')}
            >
              Entrar
            </Button>
            
            <Button
              size="$5"
              variant="outlined"
              borderColor="white"
              color="white"
              borderRadius="$6"
              fontWeight="600"
              onPress={() => router.push('/register')}
            >
              Criar Conta
            </Button>

            {/* Continuar sem login */}
            <Button
              size="$4"
              backgroundColor="transparent"
              color="rgba(255,255,255,0.8)"
              borderRadius="$6"
              fontWeight="500"
              onPress={() => router.push('/(tabs)')}
              pressStyle={{
                backgroundColor: "rgba(255,255,255,0.1)"
              }}
            >
              <XStack alignItems="center" gap="$2">
                <Ionicons name="arrow-forward-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text color="rgba(255,255,255,0.8)" fontSize="$4">
                  Continuar sem login
                </Text>
              </XStack>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    </LinearGradient>
  );
}

