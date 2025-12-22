// BeanLog App Entry Point
// 문서 참조: The Implementation Guide - 개발 실행 계획서

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, ThemeProvider } from './src/contexts';
import { AppNavigator } from './src/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

import { initRemoteConfig } from './src/services/remoteConfig';
import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    initRemoteConfig();
  }, []);

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
