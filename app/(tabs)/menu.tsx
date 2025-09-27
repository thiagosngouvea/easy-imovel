import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../../src/components/Header';
import { useAuthStore } from '../../src/hooks/useAuthStore';

export default function MenuScreen() {
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'client': return 'Cliente';
      case 'agent': return 'Corretor';
      case 'agency': return 'Imobiliária';
      default: return 'Usuário';
    }
  };

  const getUserTypeIcon = () => {
    switch (user?.userType) {
      case 'client': return 'person-outline';
      case 'agent': return 'briefcase-outline';
      case 'agency': return 'business-outline';
      default: return 'person-outline';
    }
  };

  const canManageProperties = user?.userType === 'agent' || user?.userType === 'agency';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <Header
        title="Menu"
        backgroundColor="$background"
        textColor="$color"
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {/* User Profile Card */}
          {isAuthenticated && user ? (
            <Card padding="$4" backgroundColor="$background" borderRadius="$4">
              <XStack alignItems="center" gap="$4">
                <YStack
                  backgroundColor="$orange9"
                  borderRadius="$10"
                  padding="$4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name={getUserTypeIcon() as any} size={32} color="white" />
                </YStack>
                
                <YStack flex={1}>
                  <Text fontSize="$6" fontWeight="bold" color="$color">
                    {user.name}
                  </Text>
                  <Text fontSize="$4" color="$gray10">
                    {user.email}
                  </Text>
                  <XStack alignItems="center" gap="$2" marginTop="$1">
                    <YStack
                      backgroundColor="$orange2"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$3"
                    >
                      <Text fontSize="$3" color="$orange11" fontWeight="600">
                        {getUserTypeLabel()}
                      </Text>
                    </YStack>
                    <Text fontSize="$3" color="$gray10">
                      {user.city}, {user.state}
                    </Text>
                  </XStack>
                  {user.company && (
                    <Text fontSize="$3" color="$gray10" marginTop="$1">
                      {user.company}
                    </Text>
                  )}
                </YStack>
              </XStack>
            </Card>
          ) : (
            <Card padding="$4" backgroundColor="$background" borderRadius="$4">
              <YStack alignItems="center" gap="$3">
                <Ionicons name="person-circle-outline" size={64} color="#ccc" />
                <Text fontSize="$5" fontWeight="600" color="$color">
                  Você não está logado
                </Text>
                <Text fontSize="$4" color="$gray10" textAlign="center">
                  Faça login para acessar todas as funcionalidades
                </Text>
                <XStack gap="$3" marginTop="$2">
                  <Button
                    size="$4"
                    backgroundColor="$orange9"
                    color="white"
                    onPress={() => router.push('/login')}
                  >
                    Entrar
                  </Button>
                  <Button
                    size="$4"
                    variant="outlined"
                    borderColor="$orange9"
                    color="$orange9"
                    onPress={() => router.push('/register')}
                  >
                    Criar Conta
                  </Button>
                </XStack>
              </YStack>
            </Card>
          )}

          {/* Menu Options */}
          <YStack gap="$3">
            {/* Property Management - Only for agents and agencies */}
            {canManageProperties && (
              <TouchableOpacity onPress={() => router.push('/add-property')}>
                <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                  <XStack alignItems="center" gap="$4">
                    <YStack
                      backgroundColor="$green2"
                      borderRadius="$6"
                      padding="$3"
                    >
                      <Ionicons name="add-circle-outline" size={24} color="#22c55e" />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        Cadastrar Imóvel
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        Adicione novos imóveis à plataforma
                      </Text>
                    </YStack>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </XStack>
                </Card>
              </TouchableOpacity>
            )}

            {canManageProperties && (
              <TouchableOpacity onPress={() => router.push('/my-properties')}>
                <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                  <XStack alignItems="center" gap="$4">
                    <YStack
                      backgroundColor="$blue2"
                      borderRadius="$6"
                      padding="$3"
                    >
                      <Ionicons name="home-outline" size={24} color="#3b82f6" />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        Meus Imóveis
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        Gerencie seus imóveis cadastrados
                      </Text>
                    </YStack>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </XStack>
                </Card>
              </TouchableOpacity>
            )}

            {/* Profile Settings */}
            {isAuthenticated && (
              <TouchableOpacity onPress={() => router.push('/profile')}>
                <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                  <XStack alignItems="center" gap="$4">
                    <YStack
                      backgroundColor="$purple2"
                      borderRadius="$6"
                      padding="$3"
                    >
                      <Ionicons name="person-outline" size={24} color="#8b5cf6" />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        Editar Perfil
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        Atualize suas informações pessoais
                      </Text>
                    </YStack>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </XStack>
                </Card>
              </TouchableOpacity>
            )}

            {/* Settings */}
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                <XStack alignItems="center" gap="$4">
                  <YStack
                    backgroundColor="$gray2"
                    borderRadius="$6"
                    padding="$3"
                  >
                    <Ionicons name="settings-outline" size={24} color="#6b7280" />
                  </YStack>
                  <YStack flex={1}>
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      Configurações
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      Preferências e configurações do app
                    </Text>
                  </YStack>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </XStack>
              </Card>
            </TouchableOpacity>

            {/* Help */}
            <TouchableOpacity onPress={() => router.push('/help')}>
              <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                <XStack alignItems="center" gap="$4">
                  <YStack
                    backgroundColor="$yellow2"
                    borderRadius="$6"
                    padding="$3"
                  >
                    <Ionicons name="help-circle-outline" size={24} color="#eab308" />
                  </YStack>
                  <YStack flex={1}>
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      Ajuda e Suporte
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      Tire suas dúvidas e entre em contato
                    </Text>
                  </YStack>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </XStack>
              </Card>
            </TouchableOpacity>

            {/* Logout */}
            {isAuthenticated && (
              <TouchableOpacity onPress={handleLogout}>
                <Card padding="$4" backgroundColor="$background" borderRadius="$4">
                  <XStack alignItems="center" gap="$4">
                    <YStack
                      backgroundColor="$red2"
                      borderRadius="$6"
                      padding="$3"
                    >
                      <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$red10">
                        Sair
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        Desconectar da sua conta
                      </Text>
                    </YStack>
                    <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                  </XStack>
                </Card>
              </TouchableOpacity>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
