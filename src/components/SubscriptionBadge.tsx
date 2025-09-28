import { Ionicons } from '@expo/vector-icons';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { getPlanById } from '../data/plans';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';

interface SubscriptionBadgeProps {
  showDetails?: boolean;
}

export default function SubscriptionBadge({ showDetails = false }: SubscriptionBadgeProps) {
  const { user } = useAuthStore();
  const { currentSubscription, loadUserSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (user && (user.userType === 'agent' || user.userType === 'agency')) {
      loadUserSubscription(user.id);
    }
  }, [user]);

  // Não mostrar para clientes
  if (!user || user.userType === 'client') {
    return null;
  }

  // Mostrar status baseado no usuário se não há assinatura carregada
  if (!currentSubscription) {
    // Se o usuário tem status de assinatura, mostrar baseado nisso
    if (user.subscriptionStatus === 'active' && user.planType) {
      const colors = { bg: '$green2', text: '$green11', icon: '#22c55e' };
      return (
        <TouchableOpacity onPress={() => router.push('/subscription')}>
          <XStack
            alignItems="center"
            gap="$2"
            backgroundColor={colors.bg}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$3"
          >
            <Ionicons name="checkmark-circle" size={14} color={colors.icon} />
            <Text fontSize="$3" fontWeight="600" color={colors.text}>
              {user.planType === 'basic' ? 'Básico' : 
               user.planType === 'premium' ? 'Premium' : 
               user.planType === 'enterprise' ? 'Empresarial' : 'Ativo'}
            </Text>
          </XStack>
        </TouchableOpacity>
      );
    }
    
    // Se não tem assinatura, mostrar botão para escolher plano
    return (
      <TouchableOpacity onPress={() => router.push('/plans')}>
        <XStack
          alignItems="center"
          gap="$2"
          backgroundColor="$orange2"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
        >
          <Ionicons name="diamond-outline" size={16} color="#FB923C" />
          <Text fontSize="$3" fontWeight="600" color="$orange11">
            Escolher Plano
          </Text>
        </XStack>
      </TouchableOpacity>
    );
  }

  const currentPlan = getPlanById(currentSubscription.planId);
  
  const getStatusColor = () => {
    switch (currentSubscription.status) {
      case 'active':
        return { bg: '$green2', text: '$green11', icon: '#22c55e' };
      case 'pending':
        return { bg: '$yellow2', text: '$yellow11', icon: '#f59e0b' };
      case 'cancelled':
      case 'expired':
        return { bg: '$red2', text: '$red11', icon: '#ef4444' };
      default:
        return { bg: '$gray2', text: '$gray11', icon: '#6b7280' };
    }
  };

  const getStatusLabel = () => {
    switch (currentSubscription.status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'expired':
        return 'Expirado';
      default:
        return 'Inativo';
    }
  };

  const colors = getStatusColor();

  if (showDetails) {
    return (
      <TouchableOpacity onPress={() => router.push('/subscription')}>
        <YStack
          backgroundColor={colors.bg}
          padding="$3"
          borderRadius="$3"
          gap="$1"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$3" fontWeight="600" color={colors.text}>
              {currentPlan?.name || 'Plano Desconhecido'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Ionicons 
              name={currentSubscription.status === 'active' ? 'checkmark-circle' : 'alert-circle'} 
              size={12} 
              color={colors.icon} 
            />
            <Text fontSize="$2" color={colors.text}>
              {getStatusLabel()}
            </Text>
          </XStack>
        </YStack>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => router.push('/subscription')}>
      <XStack
        alignItems="center"
        gap="$2"
        backgroundColor={colors.bg}
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$3"
      >
        <Ionicons 
          name={currentSubscription.status === 'active' ? 'checkmark-circle' : 'alert-circle'} 
          size={14} 
          color={colors.icon} 
        />
        <Text fontSize="$3" fontWeight="600" color={colors.text}>
          {currentPlan?.type === 'basic' ? 'Básico' : 
           currentPlan?.type === 'premium' ? 'Premium' : 
           currentPlan?.type === 'enterprise' ? 'Empresarial' : 'Plano'}
        </Text>
      </XStack>
    </TouchableOpacity>
  );
}
