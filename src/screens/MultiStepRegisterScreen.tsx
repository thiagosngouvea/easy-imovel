import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Card } from '@tamagui/card';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMonthlyEquivalent, getPlansForUserType } from '../data/plans';
import { useAuthStore, UserType } from '../hooks/useAuthStore';
import { useSubscriptionStore } from '../hooks/useSubscriptionStore';
import { PaymentIntent, Plan } from '../types/Subscription';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const USER_TYPES = [
  { value: 'client' as UserType, label: 'Cliente', description: 'Procuro imóveis para alugar', icon: 'person-outline' },
  { value: 'agent' as UserType, label: 'Corretor', description: 'Sou corretor de imóveis', icon: 'briefcase-outline' },
  { value: 'agency' as UserType, label: 'Imobiliária', description: 'Represento uma imobiliária', icon: 'business-outline' },
];

type RegistrationStep = 'user_info' | 'plan_selection' | 'payment';

export default function MultiStepRegisterScreen() {
  // Step control
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('user_info');
  
  // User info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [company, setCompany] = useState('');
  const [creci, setCreci] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { register, isLoading, updateSubscriptionStatus } = useAuthStore();
  const { 
    plans, 
    createPaymentIntent, 
    confirmPayment, 
    loadPlans 
  } = useSubscriptionStore();

  useEffect(() => {
    loadPlans();
  }, []);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getSavingsText = (plan: Plan) => {
    if (plan.billingCycle === 'yearly') {
      const monthlySamePlan = plans.find(p => p.type === plan.type && p.billingCycle === 'monthly');
      if (monthlySamePlan) {
        const savings = ((monthlySamePlan.price * 12 - plan.price) / (monthlySamePlan.price * 12)) * 100;
        return `Economize ${savings.toFixed(0)}%`;
      }
    }
    return null;
  };

  const validateUserInfo = () => {
    console.log('Validating user info:', { name, email, password, confirmPassword, city, state, userType, company, creci });
    
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !city.trim() || !state.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (userType !== 'client' && !company?.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da empresa');
      return false;
    }

    if (userType === 'agent' && !creci?.trim()) {
      Alert.alert('Erro', 'Por favor, informe o número do CRECI');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    console.log('Current step:', currentStep, 'User type:', userType);
    
    if (currentStep === 'user_info') {
      if (!validateUserInfo()) return;
      
      console.log('Validation passed, user type:', userType);
      
      // Se for cliente, registrar diretamente
      if (userType === 'client') {
        console.log('Client registration');
        handleCompleteRegistration();
      } else {
        // Para corretor/imobiliária, ir para seleção de plano
        console.log('Going to plan selection');
        setCurrentStep('plan_selection');
      }
    } else if (currentStep === 'plan_selection') {
      console.log('Plan selection step, selected plan:', selectedPlan);
      if (!selectedPlan) {
        Alert.alert('Erro', 'Selecione um plano para continuar');
        return;
      }
      console.log('Going to payment');
      setCurrentStep('payment');
    }
  };

  const handleCompleteRegistration = async () => {
    const success = await register(name, email, password, city, state, userType, company, creci, phone);
    
    if (success) {
      Alert.alert(
        'Conta Criada!', 
        'Sua conta foi criada com sucesso!',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } else {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    // Validar dados do cartão
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      Alert.alert('Erro', 'Preencha todos os dados do cartão');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Primeiro, criar a conta do usuário
      const registrationSuccess = await register(name, email, password, city, state, userType, company, creci, phone);
      
      if (!registrationSuccess) {
        Alert.alert('Erro', 'Falha ao criar conta. Tente novamente.');
        return;
      }

      // Criar intenção de pagamento
      if (!paymentIntent) {
        const intent = await createPaymentIntent(selectedPlan.id, 'credit_card');
        if (!intent) {
          Alert.alert('Erro', 'Falha ao processar pagamento. Tente novamente.');
          return;
        }
        setPaymentIntent(intent);
      }

      // Confirmar pagamento
      const paymentSuccess = await confirmPayment(paymentIntent?.id || '');
      
      if (paymentSuccess) {
        // Atualizar status da assinatura no usuário
        updateSubscriptionStatus('active', selectedPlan.type);
        
        Alert.alert(
          'Sucesso!', 
          'Conta criada e pagamento processado com sucesso! Bem-vindo ao Easy Imóvel.',
          [
            { 
              text: 'Começar', 
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha no processamento do pagamento. Entre em contato com o suporte.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'user_info': return 'Criar Conta';
      case 'plan_selection': return 'Escolha seu Plano';
      case 'payment': return 'Pagamento';
      default: return 'Registro';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'user_info': return 'Preencha seus dados para começar';
      case 'plan_selection': return 'Selecione o plano ideal para seu negócio';
      case 'payment': return 'Finalize seu cadastro com o pagamento';
      default: return '';
    }
  };

  const availablePlans = userType ? getPlansForUserType(userType as 'agent' | 'agency') : plans;
  const filteredPlans = availablePlans.filter(plan => plan.billingCycle === billingCycle);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <XStack
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$4"
        >
          <TouchableOpacity onPress={() => {
            if (currentStep === 'user_info') {
              router.back();
            } else if (currentStep === 'plan_selection') {
              setCurrentStep('user_info');
            } else if (currentStep === 'payment') {
              setCurrentStep('plan_selection');
            }
          }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <YStack flex={1} alignItems="center">
            <Text fontSize="$5" fontWeight="600" color="$color">
              {getStepTitle()}
            </Text>
            <Text fontSize="$3" color="$gray10">
              Etapa {currentStep === 'user_info' ? '1' : currentStep === 'plan_selection' ? '2' : '3'} de {userType === 'client' ? '1' : '3'}
            </Text>
          </YStack>
          
          <YStack width={24} />
        </XStack>

        {/* Progress Bar */}
        {userType !== 'client' && (
          <YStack paddingHorizontal="$4" marginBottom="$4">
            <XStack gap="$2">
              <YStack 
                flex={1} 
                height={4} 
                backgroundColor={currentStep === 'user_info' ? "$orange9" : "$orange9"}
                borderRadius="$2"
              />
              <YStack 
                flex={1} 
                height={4} 
                backgroundColor={currentStep === 'plan_selection' || currentStep === 'payment' ? "$orange9" : "$gray5"}
                borderRadius="$2"
              />
              <YStack 
                flex={1} 
                height={4} 
                backgroundColor={currentStep === 'payment' ? "$orange9" : "$gray5"}
                borderRadius="$2"
              />
            </XStack>
          </YStack>
        )}

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack
            flex={1}
            paddingHorizontal="$6"
            paddingVertical="$4"
            gap="$4"
          >
            {/* Debug Info */}
            <Card padding="$3" backgroundColor="$yellow2" marginBottom="$2">
              <Text fontSize="$3" color="$yellow11" textAlign="center">
                DEBUG: Step = {currentStep} | UserType = {userType}
              </Text>
            </Card>

            {/* Logo e Título */}
            <YStack alignItems="center" gap="$3" marginTop="$4">
              <YStack
                backgroundColor="$orange9"
                borderRadius="$8"
                padding="$4"
              >
                <Ionicons name="home" size={40} color="white" />
              </YStack>
              
              <Text
                fontSize="$7"
                fontWeight="bold"
                color="$color"
                textAlign="center"
              >
                {getStepTitle()}
              </Text>
              
              <Text
                fontSize="$4"
                color="$gray10"
                textAlign="center"
              >
                {getStepDescription()}
              </Text>
            </YStack>

            {/* Step Content */}
            {currentStep === 'user_info' && (
              <YStack gap="$4" marginTop="$4">
                {/* Tipo de Usuário */}
                <YStack gap="$3">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Você é:
                  </Text>
                  <YStack gap="$2">
                    {USER_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() => setUserType(type.value)}
                      >
                        <XStack
                          alignItems="center"
                          padding="$4"
                          borderRadius="$4"
                          borderWidth={1}
                          borderColor={userType === type.value ? "$orange9" : "$borderColor"}
                          backgroundColor={userType === type.value ? "$orange1" : "$background"}
                          gap="$3"
                        >
                          <Ionicons 
                            name={type.icon as any} 
                            size={24} 
                            color={userType === type.value ? "#FB923C" : "#666"} 
                          />
                          <YStack flex={1}>
                            <Text 
                              fontSize="$4" 
                              fontWeight="600" 
                              color={userType === type.value ? "$orange11" : "$color"}
                            >
                              {type.label}
                            </Text>
                            <Text 
                              fontSize="$3" 
                              color={userType === type.value ? "$orange10" : "$gray10"}
                            >
                              {type.description}
                            </Text>
                          </YStack>
                          {userType === type.value && (
                            <Ionicons name="checkmark-circle" size={20} color="#FB923C" />
                          )}
                        </XStack>
                      </TouchableOpacity>
                    ))}
                  </YStack>
                </YStack>

                {/* Dados Pessoais */}
                <YStack gap="$3">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Dados Pessoais
                  </Text>
                  
                  <Input
                    placeholder="Nome completo"
                    placeholderTextColor="$gray10"
                    borderColor="$orange8"
                    value={name}
                    onChangeText={(text: any) => setName(text)}
                    autoCapitalize="words"
                  />
                  
                  <Input
                    placeholder="E-mail"
                    placeholderTextColor="$gray10"
                    borderColor="$orange8"
                    value={email}
                    onChangeText={(text: any) => setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  
                  <Input
                    placeholder="Telefone (opcional)"
                    placeholderTextColor="$gray10"
                    borderColor="$orange8"
                    value={phone}
                    onChangeText={(text: any) => setPhone(text)}
                    keyboardType="phone-pad"
                  />
                </YStack>

                {/* Dados Profissionais */}
                {userType !== 'client' && (
                  <YStack gap="$3">
                    <Text fontSize="$4" fontWeight="600" color="$color">
                      Dados Profissionais
                    </Text>
                    
                    <Input
                      placeholder={userType === 'agent' ? "Nome da imobiliária" : "Nome da empresa"}
                      value={company}
                      onChangeText={setCompany}
                      autoCapitalize="words"
                    />
                    
                    {userType === 'agent' && (
                      <Input
                        placeholder="Número do CRECI"
                        value={creci}
                        onChangeText={setCreci}
                        autoCapitalize="characters"
                      />
                    )}
                  </YStack>
                )}

                {/* Senha */}
                <YStack gap="$3">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Senha
                  </Text>
                  
                  <XStack alignItems="center" position="relative">
                    <Input
                      flex={1}
                      placeholder="Senha (mínimo 6 caracteres)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12 }}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </XStack>
                  
                  <XStack alignItems="center" position="relative">
                    <Input
                      flex={1}
                      placeholder="Confirmar senha"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: 12 }}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </XStack>
                </YStack>
              </YStack>
            )}

            {currentStep === 'plan_selection' && (
              <YStack gap="$4" marginTop="$4">
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
                    const isSelected = selectedPlan?.id === plan.id;
                    
                    return (
                      <TouchableOpacity
                        key={plan.id}
                        onPress={() => setSelectedPlan(plan)}
                      >
                        <Card 
                          padding="$4"
                          borderWidth={plan.popular ? 2 : isSelected ? 2 : 1}
                          borderColor={isSelected ? "$orange9" : plan.popular ? "$orange9" : "$borderColor"}
                          backgroundColor={isSelected ? "$orange1" : "white"}
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
                              {plan.features.slice(0, 4).map((feature, index) => (
                                <XStack key={index} alignItems="center" gap="$2">
                                  <Ionicons name="checkmark" size={16} color="#22c55e" />
                                  <Text fontSize="$3" color="$gray11" flex={1}>
                                    {feature}
                                  </Text>
                                </XStack>
                              ))}
                              {plan.features.length > 4 && (
                                <Text fontSize="$2" color="$gray10">
                                  +{plan.features.length - 4} recursos adicionais
                                </Text>
                              )}
                            </YStack>

                            {isSelected && (
                              <XStack alignItems="center" justifyContent="center" gap="$2" marginTop="$2">
                                <Ionicons name="checkmark-circle" size={16} color="#FB923C" />
                                <Text fontSize="$3" fontWeight="600" color="$orange11">
                                  Plano Selecionado
                                </Text>
                              </XStack>
                            )}
                          </YStack>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
                </YStack>
              </YStack>
            )}

            {currentStep === 'payment' && selectedPlan && (
              <YStack gap="$4" marginTop="$4">
                {/* Plan Summary */}
                <Card padding="$4" backgroundColor="$orange1" borderColor="$orange7">
                  <Text fontSize="$4" fontWeight="600" color="$orange11" marginBottom="$3">
                    Resumo do Pedido
                  </Text>
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text fontSize="$4" fontWeight="600" color="$color">
                        {selectedPlan.name}
                      </Text>
                      <Text fontSize="$3" color="$gray10">
                        {selectedPlan.billingCycle === 'monthly' ? 'Cobrança mensal' : 'Cobrança anual'}
                      </Text>
                    </YStack>
                    <Text fontSize="$5" fontWeight="700" color="$orange11">
                      {formatPrice(selectedPlan.price)}
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
              </YStack>
            )}

            {/* Debug buttons - TEMPORARY */}
            <YStack gap="$2">
              <Button
                size="$3"
                backgroundColor="$red9"
                color="white"
                onPress={() => setCurrentStep('user_info')}
              >
                DEBUG: Etapa 1
              </Button>
              <Button
                size="$3"
                backgroundColor="$red9"
                color="white"
                onPress={() => setCurrentStep('plan_selection')}
              >
                DEBUG: Etapa 2
              </Button>
              <Button
                size="$3"
                backgroundColor="$red9"
                color="white"
                onPress={() => setCurrentStep('payment')}
              >
                DEBUG: Etapa 3
              </Button>
            </YStack>

            {/* Action Button */}
            <Button
              size="$5"
              backgroundColor="$orange9"
              color="white"
              borderRadius="$4"
              fontWeight="600"
              onPress={currentStep === 'payment' ? handlePayment : handleNextStep}
              disabled={isLoading || isProcessingPayment}
              marginTop="$4"
            >
              {isProcessingPayment ? 'Processando...' : 
               isLoading ? 'Criando conta...' :
               currentStep === 'user_info' ? (userType === 'client' ? 'Criar Conta' : 'Continuar') :
               currentStep === 'plan_selection' ? 'Continuar para Pagamento' :
               'Finalizar Cadastro'}
            </Button>

            {/* Link para login */}
            <XStack
              justifyContent="center"
              alignItems="center"
              gap="$2"
              marginTop="$4"
            >
              <Text color="$gray10" fontSize="$4">
                Já tem uma conta?
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text color="$orange9" fontSize="$4" fontWeight="600">
                  Entrar
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
