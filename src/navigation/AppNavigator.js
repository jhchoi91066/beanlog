// App Navigator - 전체 네비게이션 구조
// 문서 참조: The Blueprint - G-0.2 네비게이션, G-0.4 Onboarding

import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../contexts';
import {
  LoginScreen,
  CafeDetailScreen,
  WriteReviewScreen,
  MyPageScreen,
  OnboardingScreen,
  SettingsScreen,
  CommunityScreen,
  PostDetailScreen,
  WritePostScreen,
  ProfileEditScreen,
  PrivacySecurityScreen,
  SupportScreen
} from '../screens';
import FeedHomeScreen from '../screens/FeedHomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import SearchScreen from '../screens/SearchScreen';
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
        component={FeedHomeScreen}
        options={{
          headerTitle: 'BeanLog',
        }}
      />

    </Stack.Navigator>
  );
};

// MyPage Stack Navigator (마이페이지 → 설정)
const MyPageStack = () => {
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
        name="MyPageMain"
        component={MyPageScreen}
        options={{
          headerTitle: '마이페이지',
        }}
      />
      <Stack.Screen
        name="CafeDetail"
        component={CafeDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false, // SettingsScreen has its own header
        }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator (인증 후 메인 화면) - Matches BeanLog_design structure
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Record') {
            iconName = 'add-circle'; // Always filled for highlighted effect
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Special styling for Record button
          if (route.name === 'Record') {
            return (
              <View style={{
                backgroundColor: Colors.stone800,
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name={iconName} size={32} color={Colors.backgroundWhite} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.amber600,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors.backgroundWhite,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: false,
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
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '검색',
          headerShown: true,
          headerTitle: '검색',
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
        name="Record"
        component={WriteReviewScreen}
        options={{
          tabBarLabel: '',
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
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: '탐색',
          headerShown: true,
          headerTitle: '탐색',
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
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: '커뮤니티',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageStack}
        options={{
          tabBarLabel: '마이',
          headerShown: false, // MyPageStack has its own headers
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
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '카페 상세',
                headerBackTitle: '뒤로',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.brand,
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CategoryDetail"
              component={CategoryDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WritePost"
              component={WritePostScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : user ? (
          // Returning authenticated user - Main Tabs
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '카페 상세',
                headerBackTitle: '뒤로',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.brand,
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CategoryDetail"
              component={CategoryDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WritePost"
              component={WritePostScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Returning unauthenticated user - Login
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '카페 상세',
                headerBackTitle: '뒤로',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.brand,
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CategoryDetail"
              component={CategoryDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WritePost"
              component={WritePostScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
