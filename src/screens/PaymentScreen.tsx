import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPlanById } from '../data/plans';
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';
import { PaymentIntent } from '../types/Subscription';

// Usando apenas Stripe para cartão de crédito

export default function PaymentScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { 
    isLoading, 
    createPaymentIntent, 
    confirmPayment 
  } = useSubscriptionStore();
  
  // Usando apenas cartão de crédito via Stripe
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = planId ? getPlanById(planId) : null;

  useEffect(() => {
    if (!plan) {
      Alert.alert('Erro', 'Plano não encontrado', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [plan]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCreatePaymentIntent = async () => {
    if (!plan) return;
    
    const intent = await createPaymentIntent(plan.id, 'credit_card');
    if (intent) {
      setPaymentIntent(intent);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentIntent) {
      await handleCreatePaymentIntent();
      return;
    }

    setIsProcessing(true);
    
    try {
      // Validar dados do cartão
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        Alert.alert('Erro', 'Preencha todos os dados do cartão');
        return;
      }

      const success = await confirmPayment(paymentIntent.id);
      
      if (success) {
        Alert.alert(
          'Pagamento Confirmado!', 
          'Sua assinatura foi ativada com sucesso.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(tabs)/menu')
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha no processamento do pagamento. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>Carregando...</Text>
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
          Pagamento
        </Text>
        <YStack width={24} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$4">
          {/* Plan Summary */}
          <Card padding="$4">
            <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
              Resumo do Pedido
            </Text>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="600" color="$color">
                  {plan.name}
                </Text>
                <Text fontSize="$3" color="$gray10">
                  {plan.billingCycle === 'monthly' ? 'Cobrança mensal' : 'Cobrança anual'}
                </Text>
              </YStack>
              <Text fontSize="$5" fontWeight="700" color="$orange11">
                {formatPrice(plan.price)}
              </Text>
            </XStack>
          </Card>

          {/* Payment Method Info */}
          <Card padding="$4">
            <XStack alignItems="center" gap="$3" marginBottom="$3">
              <Ionicons name="card-outline" size={24} color="#FB923C" />
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Cartão de Crédito
                </Text>
                <Text fontSize="$3" color="$gray10">
                  Pagamento seguro via Stripe
                </Text>
              </YStack>
              <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
            </XStack>
          </Card>

          {/* Payment Details */}
            <Card padding="$4">
              <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$3">
                Dados do Cartão
              </Text>
              <YStack gap="$3">
                <YStack gap="$2">
                  <Text fontSize="$3" color="$gray11">Número do Cartão</Text>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </YStack>
                
                <YStack gap="$2">
                  <Text fontSize="$3" color="$gray11">Nome no Cartão</Text>
                  <Input
                    placeholder="Nome como está no cartão"
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </YStack>
                
                <XStack gap="$3">
                  <YStack flex={1} gap="$2">
                    <Text fontSize="$3" color="$gray11">Validade</Text>
                    <Input
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </YStack>
                  
                  <YStack flex={1} gap="$2">
                    <Text fontSize="$3" color="$gray11">CVV</Text>
                    <Input
                      placeholder="000"
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </YStack>
                </XStack>
              </YStack>
            </Card>

          {/* Security Info */}
          <Card padding="$4" backgroundColor="$gray2">
            <XStack alignItems="center" gap="$3">
              <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
              <YStack flex={1}>
                <Text fontSize="$3" fontWeight="600" color="$gray11">
                  Pagamento Seguro via Stripe
                </Text>
                <Text fontSize="$2" color="$gray10">
                  Seus dados são protegidos com criptografia SSL de nível bancário
                </Text>
              </YStack>
            </XStack>
          </Card>

          {/* Confirm Button */}
          <Button
            backgroundColor="$orange9"
            color="white"
            fontWeight="600"
            size="$5"
            disabled={isLoading || isProcessing}
            onPress={handleConfirmPayment}
            marginTop="$2"
          >
            {isProcessing ? 'Processando Pagamento...' : 
             paymentIntent ? 'Confirmar Pagamento' : 'Processar Pagamento'}
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
