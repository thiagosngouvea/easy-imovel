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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Email ou senha incorretos');
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
            gap="$6"
          >
            {/* Logo e Título */}
            <YStack alignItems="center" gap="$4" marginTop="$6">
              <YStack
                backgroundColor="$orange9"
                borderRadius="$8"
                padding="$4"
              >
                <Ionicons name="home" size={50} color="white" />
              </YStack>
              
              <Text
                fontSize="$8"
                fontWeight="bold"
                color="$color"
                textAlign="center"
              >
                Bem-vindo de volta!
              </Text>
              
              <Text
                fontSize="$4"
                color="$gray10"
                textAlign="center"
              >
                Entre na sua conta para continuar
              </Text>
            </YStack>

            {/* Formulário */}
            <YStack gap="$4" marginTop="$6">
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="600" color="$color">
                  Email
                </Text>
                <Input
                  size="$4"
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={(text: any) => setEmail(text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={undefined}
                  borderRadius="$4"
                />
              </YStack>

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
                    onChangeText={(text: any) => setPassword(text)}
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

              <Button
                size="$5"
                backgroundColor="$orange9"
                color="white"
                borderRadius="$4"
                fontWeight="600"
                onPress={handleLogin}
                disabled={isLoading}
                marginTop="$4"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </YStack>

            {/* Link para cadastro */}
            <XStack
              justifyContent="center"
              alignItems="center"
              gap="$2"
              marginTop="$6"
            >
              <Text color="$gray10" fontSize="$4">
                Não tem uma conta?
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text color="$orange9" fontSize="$4" fontWeight="600">
                  Cadastre-se
                </Text>
              </TouchableOpacity>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

