import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMonthlyEquivalent, getPlansForUserType } from '../data/plans';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';
import { Plan } from '../types/Subscription';

export default function PlansScreen() {
  const { user } = useAuthStore();
  const { 
    plans, 
    currentSubscription, 
    isLoading, 
    loadPlans, 
    loadUserSubscription 
  } = useSubscriptionStore();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadUserSubscription(user.id);
    }
  }, [user]);

  const availablePlans = user ? getPlansForUserType(user.userType as 'agent' | 'agency') : plans;
  const filteredPlans = availablePlans.filter(plan => plan.billingCycle === billingCycle);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    // Navegar para tela de pagamento
    router.push({
      pathname: '/payment',
      params: { planId: plan.id }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getSavingsText = (plan: Plan) => {
    if (plan.billingCycle === 'yearly') {
      const monthlyEquivalent = getMonthlyEquivalent(plan);
      const monthlySamePlan = plans.find(p => p.type === plan.type && p.billingCycle === 'monthly');
      if (monthlySamePlan) {
        const savings = ((monthlySamePlan.price * 12 - plan.price) / (monthlySamePlan.price * 12)) * 100;
        return `Economize ${savings.toFixed(0)}%`;
      }
    }
    return null;
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
            Os planos são disponíveis apenas para corretores e imobiliárias
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
          Escolha seu Plano
        </Text>
        <YStack width={24} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {/* Current Subscription Info */}
          {currentSubscription && (
            <Card padding="$4" backgroundColor="$green2" borderColor="$green7">
              <XStack alignItems="center" gap="$3">
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color="$green11">
                    Plano Ativo
                  </Text>
                  <Text fontSize="$3" color="$green10">
                    Status: {currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )}

          {/* Billing Cycle Toggle */}
          <Card padding="$4">
            <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
              Ciclo de Cobrança
            </Text>
            <XStack gap="$2">
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setBillingCycle('monthly')}
              >
                <YStack
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={billingCycle === 'monthly' ? "$orange9" : "$borderColor"}
                  backgroundColor={billingCycle === 'monthly' ? "$orange1" : "transparent"}
                  alignItems="center"
                >
                  <Text 
                    fontSize="$3" 
                    fontWeight="600"
                    color={billingCycle === 'monthly' ? "$orange11" : "$color"}
                  >
                    Mensal
                  </Text>
                </YStack>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setBillingCycle('yearly')}
              >
                <YStack
                  padding="$3"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor={billingCycle === 'yearly' ? "$orange9" : "$borderColor"}
                  backgroundColor={billingCycle === 'yearly' ? "$orange1" : "transparent"}
                  alignItems="center"
                >
                  <Text 
                    fontSize="$3" 
                    fontWeight="600"
                    color={billingCycle === 'yearly' ? "$orange11" : "$color"}
                  >
                    Anual
                  </Text>
                  <Text 
                    fontSize="$2" 
                    color={billingCycle === 'yearly' ? "$orange10" : "$gray10"}
                  >
                    2 meses grátis
                  </Text>
                </YStack>
              </TouchableOpacity>
            </XStack>
          </Card>

          {/* Plans */}
          <YStack gap="$3">
            {filteredPlans.map((plan) => {
              const savings = getSavingsText(plan);
              const isCurrentPlan = currentSubscription?.planId === plan.id;
              
              return (
                <Card 
                  key={plan.id}
                  padding="$4"
                  borderWidth={plan.popular ? 2 : 1}
                  borderColor={plan.popular ? "$orange9" : "$borderColor"}
                  backgroundColor={isCurrentPlan ? "$green1" : "white"}
                  position="relative"
                >
                  {plan.popular && (
                    <YStack
                      position="absolute"
                      top={-10}
                      right="$4"
                      backgroundColor="$orange9"
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      borderRadius="$2"
                    >
                      <Text fontSize="$2" fontWeight="600" color="white">
                        POPULAR
                      </Text>
                    </YStack>
                  )}

                  {isCurrentPlan && (
                    <XStack alignItems="center" gap="$2" marginBottom="$3">
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text fontSize="$2" fontWeight="600" color="$green11">
                        PLANO ATUAL
                      </Text>
                    </XStack>
                  )}

                  <YStack gap="$3">
                    {/* Plan Header */}
                    <XStack alignItems="flex-start" justifyContent="space-between">
                      <YStack flex={1}>
                        <Text fontSize="$5" fontWeight="700" color="$color">
                          {plan.name}
                        </Text>
                        {savings && (
                          <Text fontSize="$2" fontWeight="600" color="$orange11">
                            {savings}
                          </Text>
                        )}
                      </YStack>
                      <YStack alignItems="flex-end">
                        <XStack alignItems="baseline" gap="$1">
                          <Text fontSize="$6" fontWeight="700" color="$orange11">
                            {formatPrice(plan.price)}
                          </Text>
                          <Text fontSize="$3" color="$gray10">
                            /{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                          </Text>
                        </XStack>
                        {plan.billingCycle === 'yearly' && (
                          <Text fontSize="$2" color="$gray10">
                            {formatPrice(getMonthlyEquivalent(plan))}/mês
                          </Text>
                        )}
                      </YStack>
                    </XStack>

                    {/* Features */}
                    <YStack gap="$2">
                      {plan.features.map((feature, index) => (
                        <XStack key={index} alignItems="center" gap="$2">
                          <Ionicons name="checkmark" size={16} color="#22c55e" />
                          <Text fontSize="$3" color="$gray11" flex={1}>
                            {feature}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>

                    {/* Action Button */}
                    <Button
                      backgroundColor={isCurrentPlan ? "$gray8" : "$orange9"}
                      color="white"
                      fontWeight="600"
                      disabled={isCurrentPlan || isLoading}
                      onPress={() => handleSelectPlan(plan)}
                      marginTop="$2"
                    >
                      {isCurrentPlan ? 'Plano Atual' : 'Escolher Plano'}
                    </Button>
                  </YStack>
                </Card>
              );
            })}
          </YStack>

          {/* Footer Info */}
          <Card padding="$4" backgroundColor="$gray2">
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
                <Text fontSize="$3" color="$gray11">
                  Pagamento 100% seguro
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="refresh" size={16} color="#22c55e" />
                <Text fontSize="$3" color="$gray11">
                  Cancele a qualquer momento
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Ionicons name="headset" size={16} color="#22c55e" />
                <Text fontSize="$3" color="$gray11">
                  Suporte especializado
                </Text>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
