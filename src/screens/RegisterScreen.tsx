import { Ionicons } from '@expo/vector-icons';
import { Button } from '@tamagui/button';
import { Text } from '@tamagui/core';
import { Input } from '@tamagui/input';
import { XStack, YStack } from '@tamagui/stacks';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../hooks/useAuthStore';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !city || !state) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const success = await register(name, email, password, city, state);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <XStack
            alignItems="center"
            paddingHorizontal="$4"
            paddingVertical="$4"
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </XStack>

          <YStack
            flex={1}
            paddingHorizontal="$6"
            paddingVertical="$4"
            gap="$4"
          >
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
                Criar Conta
              </Text>
              
              <Text
                fontSize="$4"
                color="$gray10"
                textAlign="center"
              >
                Preencha os dados para começar
              </Text>
            </YStack>

            {/* Formulário */}
            <YStack gap="$4" marginTop="$4">
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Nome completo
                </Text>
                <Input
                  size="$4"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChangeText={(e) => setName(e.nativeEvent.text)}
                  borderRadius="$4"
                />
              </YStack>

              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Email
                </Text>
                <Input
                  size="$4"
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={(e) => setEmail(e.nativeEvent.text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={undefined}
                  borderRadius="$4"
                />
              </YStack>

              <XStack gap="$3">
                <YStack flex={2} gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Cidade
                  </Text>
                  <Input
                    size="$4"
                    placeholder="Sua cidade"
                    value={city}
                    onChangeText={(e) => setCity(e.nativeEvent.text)}
                    borderRadius="$4"
                  />
                </YStack>

                <YStack flex={1} gap="$2">
                  <Text fontSize="$4" fontWeight="600" color="$color">
                    Estado
                  </Text>
                  <Input
                    size="$4"
                    placeholder="UF"
                    value={state}
                    onChangeText={(e) => setState(e.nativeEvent.text.toUpperCase())}
                    maxLength={2}
                    borderRadius="$4"
                  />
                </YStack>
              </XStack>

              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Senha
                </Text>
                <XStack position="relative">
                  <Input
                    flex={1}
                    size="$4"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={(e) => setPassword(e.nativeEvent.text)}
                    secureTextEntry={!showPassword}
                    borderRadius="$4"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Confirmar senha
                </Text>
                <XStack position="relative">
                  <Input
                    flex={1}
                    size="$4"
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChangeText={(e) => setConfirmPassword(e.nativeEvent.text)}
                    secureTextEntry={!showConfirmPassword}
                    borderRadius="$4"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: [{ translateY: -12 }],
                    }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </XStack>
              </YStack>

              <Button
                size="$5"
                backgroundColor="$orange9"
                color="white"
                borderRadius="$4"
                fontWeight="600"
                onPress={handleRegister}
                disabled={isLoading}
                marginTop="$4"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </YStack>

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

