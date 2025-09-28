import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPlanById } from '../data/plans';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';
import { PaymentMethod } from '../types/Subscription';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito'
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: '#22c55e' },
  pending: { label: 'Pendente', color: '#f59e0b' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
  expired: { label: 'Expirado', color: '#6b7280' },
  failed: { label: 'Falha', color: '#ef4444' }
};

export default function SubscriptionScreen() {
  const { user } = useAuthStore();
  const { 
    currentSubscription, 
    payments, 
    isLoading, 
    loadUserSubscription, 
    loadPaymentHistory,
    cancelSubscription,
    updatePaymentMethod
  } = useSubscriptionStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSubscription(user.id);
      loadPaymentHistory(user.id);
    }
  }, [user]);

  const currentPlan = currentSubscription ? getPlanById(currentSubscription.planId) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Cancelar', 
          style: 'destructive',
          onPress: async () => {
            const success = await cancelSubscription('Cancelado pelo usuário');
            if (success) {
              Alert.alert('Sucesso', 'Assinatura cancelada com sucesso.');
            }
          }
        }
      ]
    );
  };

  const handleChangePaymentMethod = () => {
    Alert.alert(
      'Alterar Cartão de Crédito',
      'Deseja atualizar os dados do seu cartão de crédito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Atualizar Cartão', 
          onPress: () => {
            // Navegar para tela de atualização de cartão
            router.push('/update-payment-method');
          }
        }
      ]
    );
  };

  if (!user || (user.userType !== 'agent' && user.userType !== 'agency')) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Ionicons name="lock-closed-outline" size={64} color="#666" />
          <Text fontSize="$6" fontWeight="600" color="$gray11" textAlign="center" marginTop="$4">
            Acesso Restrito
          </Text>
          <Text fontSize="$4" color="$gray10" textAlign="center" marginTop="$2">
            Assinaturas são disponíveis apenas para corretores e imobiliárias
          </Text>
          <Button
            marginTop="$4"
            onPress={() => router.back()}
            backgroundColor="$orange9"
            color="white"
          >
            Voltar
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
        alignItems="center" 
        justifyContent="space-between" 
        padding="$4" 
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text fontSize="$5" fontWeight="600" color="$color">
          Minha Assinatura
        </Text>
        <YStack width={24} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {!currentSubscription ? (
            /* No Subscription */
            <Card padding="$4" alignItems="center">
              <Ionicons name="card-outline" size={64} color="#666" />
              <Text fontSize="$5" fontWeight="600" color="$gray11" textAlign="center" marginTop="$3">
                Nenhuma Assinatura Ativa
              </Text>
              <Text fontSize="$3" color="$gray10" textAlign="center" marginTop="$2">
                Escolha um plano para começar a usar todos os recursos
              </Text>
              <Button
                marginTop="$4"
                backgroundColor="$orange9"
                color="white"
                onPress={() => router.push('/plans')}
              >
                Ver Planos
              </Button>
            </Card>
          ) : (
            <>
              {/* Current Subscription */}
              <Card padding="$4">
                <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Plano Atual
                  </Text>
                  <YStack 
                    backgroundColor={STATUS_LABELS[currentSubscription.status]?.color || '#6b7280'}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                  >
                    <Text fontSize="$2" fontWeight="600" color="white">
                      {STATUS_LABELS[currentSubscription.status]?.label || currentSubscription.status}
                    </Text>
                  </YStack>
                </XStack>

                {currentPlan && (
                  <YStack gap="$3">
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack flex={1}>
                        <Text fontSize="$5" fontWeight="700" color="$color">
                          {currentPlan.name}
                        </Text>
                        <Text fontSize="$3" color="$gray10">
                          {currentPlan.billingCycle === 'monthly' ? 'Cobrança mensal' : 'Cobrança anual'}
                        </Text>
                      </YStack>
                      <Text fontSize="$5" fontWeight="700" color="$orange11">
                        {formatPrice(currentPlan.price)}
                      </Text>
                    </XStack>

                    <YStack gap="$2">
                      <XStack justifyContent="space-between">
                        <Text fontSize="$3" color="$gray10">Início:</Text>
                        <Text fontSize="$3" color="$color">
                          {formatDate(currentSubscription.startDate)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text fontSize="$3" color="$gray10">Renovação:</Text>
                        <Text fontSize="$3" color="$color">
                          {currentSubscription.nextPaymentDate ? 
                            formatDate(currentSubscription.nextPaymentDate) : 
                            'N/A'
                          }
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text fontSize="$3" color="$gray10">Método de Pagamento:</Text>
                        <Text fontSize="$3" color="$color">
                          {PAYMENT_METHOD_LABELS[currentSubscription.paymentMethod]}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text fontSize="$3" color="$gray10">Renovação Automática:</Text>
                        <Text fontSize="$3" color="$color">
                          {currentSubscription.autoRenew ? 'Ativa' : 'Inativa'}
                        </Text>
                      </XStack>
                    </YStack>
                  </YStack>
                )}
              </Card>

              {/* Plan Features */}
              {currentPlan && (
                <Card padding="$4">
                  <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
                    Recursos do Seu Plano
                  </Text>
                  <YStack gap="$2">
                    {currentPlan.features.map((feature, index) => (
                      <XStack key={index} alignItems="center" gap="$2">
                        <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                        <Text fontSize="$3" color="$gray11" flex={1}>
                          {feature}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                </Card>
              )}

              {/* Actions */}
              <Card padding="$4">
                <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
                  Gerenciar Assinatura
                </Text>
                <YStack gap="$3">
                  <Button
                    backgroundColor="$blue9"
                    color="white"
                    onPress={() => router.push('/plans')}
                  >
                    <XStack alignItems="center" gap="$2">
                      <Ionicons name="arrow-up-outline" size={16} color="white" />
                      <Text color="white" fontWeight="600">Alterar Plano</Text>
                    </XStack>
                  </Button>

                   <Button
                     backgroundColor="$gray8"
                     color="white"
                     onPress={handleChangePaymentMethod}
                   >
                     <XStack alignItems="center" gap="$2">
                       <Ionicons name="card-outline" size={16} color="white" />
                       <Text color="white" fontWeight="600">Alterar Cartão</Text>
                     </XStack>
                   </Button>

                  {currentSubscription.status === 'active' && (
                    <Button
                      backgroundColor="$red9"
                      color="white"
                      onPress={handleCancelSubscription}
                    >
                      <XStack alignItems="center" gap="$2">
                        <Ionicons name="close-circle-outline" size={16} color="white" />
                        <Text color="white" fontWeight="600">Cancelar Assinatura</Text>
                      </XStack>
                    </Button>
                  )}
                </YStack>
              </Card>
            </>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <Card padding="$4">
              <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
                Histórico de Pagamentos
              </Text>
              <YStack gap="$3">
                {payments.map((payment) => (
                  <XStack 
                    key={payment.id}
                    justifyContent="space-between" 
                    alignItems="center"
                    padding="$3"
                    backgroundColor="$gray1"
                    borderRadius="$3"
                  >
                    <YStack flex={1}>
                      <Text fontSize="$3" fontWeight="600" color="$color">
                        {formatPrice(payment.amount)}
                      </Text>
                      <Text fontSize="$2" color="$gray10">
                        {formatDate(payment.createdAt)} • {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                      </Text>
                    </YStack>
                    <YStack 
                      backgroundColor={payment.status === 'completed' ? '#22c55e' : '#f59e0b'}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                    >
                      <Text fontSize="$2" fontWeight="600" color="white">
                        {payment.status === 'completed' ? 'Pago' : 'Pendente'}
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
            </Card>
          )}

          {/* Support */}
          <Card padding="$4" backgroundColor="$gray2">
            <XStack alignItems="center" gap="$3">
              <Ionicons name="headset-outline" size={24} color="#666" />
              <YStack flex={1}>
                <Text fontSize="$3" fontWeight="600" color="$gray11">
                  Precisa de Ajuda?
                </Text>
                <Text fontSize="$2" color="$gray10">
                  Entre em contato com nosso suporte
                </Text>
              </YStack>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </XStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
