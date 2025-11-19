// App Navigator - 전체 네비게이션 구조
// 문서 참조: The Blueprint - G-0.2 네비게이션, G-0.4 Onboarding

import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../contexts';
import { LoginScreen, HomeScreen, CafeDetailScreen, WriteReviewScreen, MyPageScreen, OnboardingScreen } from '../screens';
import { Colors } from '../constants';
import { LoadingSpinner } from '../components';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator (카페 리스트 → 카페 상세)
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.brand,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{
          headerTitle: 'BeanLog',
        }}
      />
      <Stack.Screen
        name="CafeDetail"
        component={CafeDetailScreen}
        options={{
          headerTitle: '카페 상세',
          headerBackTitle: '뒤로',
        }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator (인증 후 메인 화면)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WriteReview') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          borderTopColor: Colors.border,
        },
        headerShown: false, // Hide header for tabs since Home Stack has its own header
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={{
          tabBarLabel: '리뷰 쓰기',
          headerShown: true,
          headerTitle: '리뷰 작성',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.brand,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이',
          headerShown: true,
          headerTitle: '마이페이지',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.brand,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator - Handles onboarding, authentication, and main navigation
const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check if user has completed onboarding on app launch
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingStatus === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if check fails
        setHasSeenOnboarding(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Show loading spinner while checking onboarding status or auth
  if (isCheckingOnboarding || authLoading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          // First-time user - Show Onboarding
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </>
        ) : user ? (
          // Returning authenticated user - Main Tabs
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          // Returning unauthenticated user - Login
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
