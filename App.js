// BeanLog App Entry Point
// 문서 참조: The Implementation Guide - 개발 실행 계획서

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, ThemeProvider } from './src/contexts';
import { AppNavigator } from './src/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

// TODO: Replace with your actual Sentry DSN
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  debug: true, // Enable debug in dev mode
});

const queryClient = new QueryClient();

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
