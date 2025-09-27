import { useAuthStore } from '@/src/hooks/useAuthStore';
import WelcomeScreen from '@/src/screens/WelcomeScreen';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
