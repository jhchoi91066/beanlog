// App Navigator - 전체 네비게이션 구조
// 문서 참조: The Blueprint - G-0.2 네비게이션, G-0.4 Onboarding

import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth, useTheme } from '../contexts';
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



// Root Navigator - Handles onboarding, authentication, and main navigation
const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const { colors, isDarkMode } = useTheme(); // Use theme context
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

  // Common screen options with dynamic colors
  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTintColor: colors.brand,
    headerTitleStyle: {
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    contentStyle: {
      backgroundColor: colors.background,
    },
  };

  // Tab Navigator with dynamic colors
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
                  backgroundColor: colors.stone800, // Dynamic
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
                  <Ionicons name={iconName} size={32} color={colors.backgroundWhite} />
                </View>
              );
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: colors.backgroundWhite,
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
          options={{ tabBarLabel: '홈' }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: '검색',
            headerShown: true,
            headerTitle: '검색',
            ...screenOptions,
          }}
        />
        <Tab.Screen
          name="Record"
          component={WriteReviewScreen}
          options={{
            tabBarLabel: '',
            headerShown: true,
            headerTitle: '리뷰 작성',
            ...screenOptions,
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            tabBarLabel: '탐색',
            headerShown: true,
            headerTitle: '탐색',
            ...screenOptions,
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
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    );
  };

  // Home Stack with dynamic colors
  const HomeStack = () => {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="HomeList"
          component={FeedHomeScreen}
          options={{ headerTitle: 'BeanLog' }}
        />
      </Stack.Navigator>
    );
  };

  // MyPage Stack with dynamic colors
  const MyPageStack = () => {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="MyPageMain"
          component={MyPageScreen}
          options={{ headerTitle: '마이페이지' }}
        />
        <Stack.Screen
          name="CafeDetail"
          component={CafeDetailScreen}
          options={{
            headerTitle: '',
            headerBackTitle: '',
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
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
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

  return (
    <NavigationContainer theme={isDarkMode ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: colors.brand,
        background: colors.background,
        card: colors.backgroundWhite,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.accent,
      }
    } : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: colors.brand,
        background: colors.background,
        card: colors.backgroundWhite,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.accent,
      }
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {!hasSeenOnboarding ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            {/* ... other screens ... */}
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                ...screenOptions
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
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                ...screenOptions
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
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                ...screenOptions
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
