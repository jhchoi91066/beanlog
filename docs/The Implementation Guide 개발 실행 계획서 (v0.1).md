# The Implementation Guide: 개발 실행 계획서 (v0.1)

**문서 목적:** 이 문서는 개발자가 즉시 코딩을 시작할 수 있도록 모든 실행 단계를 상세히 제공한다. 질문 없이 바로 구현할 수 있는 수준의 구체성을 목표로 한다.

**버전:** v0.1 (2025-11-17)

**운영 원칙:**
1. 이 문서의 순서대로 개발을 진행한다.
2. 각 단계의 체크리스트를 완료한 후 다음 단계로 넘어간다.
3. 예상 시간은 1인 개발 기준이며, 참고용이다.

---

## 목차
1. [프로젝트 셋업 (Day 1)](#1-프로젝트-셋업-day-1)
2. [개발 순서 및 타임라인 (4주 계획)](#2-개발-순서-및-타임라인-4주-계획)
3. [상세 구현 체크리스트](#3-상세-구현-체크리스트)
4. [Firebase 구성 상세](#4-firebase-구성-상세)
5. [컴포넌트 개발 가이드](#5-컴포넌트-개발-가이드)
6. [테스트 체크리스트](#6-테스트-체크리스트)
7. [배포 준비](#7-배포-준비)

---

## 1. 프로젝트 셋업 (Day 1)

### 1.1. 개발 환경 준비

**필수 설치 항목:**
- Node.js (v18 이상)
- npm 또는 yarn
- Expo CLI
- iOS 시뮬레이터 (Mac) 또는 Android Emulator
- VSCode (권장 에디터)

**VSCode 권장 확장:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### 1.2. 프로젝트 생성

```bash
# Expo 프로젝트 생성
npx create-expo-app beanlog
cd beanlog

# 필수 의존성 설치
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
npm install react-native-ratings
npm install @react-native-community/slider
npm install react-native-swiper

# 개발용 도구
npm install --save-dev @babel/core
```

### 1.3. 폴더 구조 생성

```bash
# 프로젝트 루트에서 실행
mkdir -p src/components
mkdir -p src/screens
mkdir -p src/navigation
mkdir -p src/contexts
mkdir -p src/constants
mkdir -p src/services
mkdir -p src/utils
mkdir -p assets/images
```

**최종 폴더 구조:**
```
beanlog/
├── src/
│   ├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── screens/           # 화면 컴포넌트
│   ├── navigation/        # 네비게이션 설정
│   ├── contexts/          # Context API (전역 상태)
│   ├── constants/         # 색상, 타이포그래피 등
│   ├── services/          # Firebase 서비스 로직
│   └── utils/             # 유틸리티 함수
├── assets/
│   └── images/            # 이미지 리소스
├── App.js                 # 앱 진입점
└── package.json
```

### 1.4. Firebase 프로젝트 셋업

**1) Firebase 콘솔에서 프로젝트 생성:**
- https://console.firebase.google.com/ 접속
- [프로젝트 추가] 클릭
- 프로젝트 이름: `beanlog-v0-1`
- Google Analytics: 활성화 (권장)

**2) iOS 앱 추가:**
- Firebase 콘솔 > 프로젝트 설정 > iOS 앱 추가
- Apple 번들 ID: `com.yourname.beanlog` (app.json과 일치시킬 것)
- `GoogleService-Info.plist` 다운로드 → 프로젝트 루트에 저장

**3) Android 앱 추가 (선택사항):**
- Firebase 콘솔 > 프로젝트 설정 > Android 앱 추가
- Android 패키지 이름: `com.yourname.beanlog`
- `google-services.json` 다운로드 → 프로젝트 루트에 저장

**4) Authentication 활성화:**
- Firebase 콘솔 > Authentication > 시작하기
- 로그인 방법 탭에서 활성화:
  - Google (필수)
  - Apple (iOS 필수)

**5) Firestore Database 생성:**
- Firebase 콘솔 > Firestore Database > 데이터베이스 만들기
- 모드: **테스트 모드로 시작** (보안 규칙은 나중에 설정)
- 위치: `asia-northeast3 (Seoul)` (권장)

### 1.5. Firebase 설정 파일 생성

**파일: `src/services/firebase.js`**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase 콘솔 > 프로젝트 설정에서 복사
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

**중요:** `firebaseConfig` 값은 Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 섹션에서 확인 가능

### 1.6. 색상 상수 정의

**파일: `src/constants/colors.js`**

```javascript
export const COLORS = {
  // Brand Colors
  brand: '#6F4E37',      // Coffee Brown
  accent: '#D4A276',     // Light Tan

  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#888888',

  // Background
  background: '#FFFFFF',

  // Status Colors
  error: '#D9534F',
  success: '#5CB85C',

  // UI Colors
  border: '#E0E0E0',
  disabled: '#CCCCCC',
};
```

### 1.7. 타이포그래피 상수 정의

**파일: `src/constants/typography.js`**

```javascript
export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  tag: {
    fontSize: 13,
    fontWeight: '500',
  },
};
```

### 1.8. 체크리스트: Day 1 완료 확인

- [ ] Expo 프로젝트 생성 완료
- [ ] 모든 필수 npm 패키지 설치 완료
- [ ] 폴더 구조 생성 완료
- [ ] Firebase 프로젝트 생성 및 iOS/Android 앱 등록 완료
- [ ] Firebase Authentication (Google, Apple) 활성화 완료
- [ ] Firestore Database 생성 완료
- [ ] `src/services/firebase.js` 설정 완료
- [ ] `src/constants/colors.js` 생성 완료
- [ ] `src/constants/typography.js` 생성 완료
- [ ] `expo start` 실행하여 앱이 시뮬레이터에서 정상 작동 확인

---

## 2. 개발 순서 및 타임라인 (4주 계획)

### Week 1: 기반 구축 (Foundation)
**목표:** 인증, 네비게이션, 기본 컴포넌트 완성

| 일차 | 작업 | 예상 시간 | 산출물 |
|------|------|-----------|--------|
| Day 1 | 프로젝트 셋업 (위 1번 섹션) | 4시간 | Firebase 설정 완료 |
| Day 2 | 인증 (G-0.3) + Context API | 6시간 | 로그인/로그아웃 동작 |
| Day 3 | 네비게이션 (G-0.2) | 4시간 | 바텀 탭 3개 화면 이동 |
| Day 4-5 | 공통 컴포넌트 (G-0.4, G-0.5) | 8시간 | 온보딩, 로딩, 에러 처리 |
| Day 6-7 | 테스트 및 버그 수정 | 6시간 | Week 1 안정화 |

**Week 1 완료 기준:**
- 로그인 → 바텀 탭 화면 이동 → 로그아웃 플로우 동작
- 온보딩 화면 1회 표시 후 스킵 기능

### Week 2: 카페 리스트 및 상세 (Discovery)
**목표:** F-1.1, F-1.2 완성

| 일차 | 작업 | 예상 시간 | 산출물 |
|------|------|-----------|--------|
| Day 8-9 | 카페 리스트 화면 (F-1.1) | 10시간 | 카페 30개 표시 |
| Day 10-11 | 카페 상세 화면 (F-1.2) | 10시간 | 카페 정보 + 리뷰 리스트 |
| Day 12 | 지역 필터 기능 | 4시간 | 성수/연남 필터 동작 |
| Day 13-14 | 테스트 및 리팩토링 | 6시간 | Week 2 안정화 |

**Week 2 완료 기준:**
- Firestore `cafes` 컬렉션에서 데이터 로드
- 지역 필터로 카페 목록 필터링
- 카페 터치 → 상세 화면 이동 → 해당 카페 리뷰 표시

### Week 3: 리뷰 작성 (Core Feature) ⭐
**목표:** F-2.1 ~ F-2.4 완성 (가장 중요)

| 일차 | 작업 | 예상 시간 | 산출물 |
|------|------|-----------|--------|
| Day 15-16 | 리뷰 작성 폼 (초급 모드) | 10시간 | 별점, 태그, 코멘트 입력 |
| Day 17-18 | 리뷰 작성 폼 (고급 모드) | 10시간 | 슬라이더, 상세 태그 확장 |
| Day 19 | Firestore 저장 로직 | 4시간 | `reviews` 컬렉션 저장 |
| Day 20-21 | 테스트 (필수 항목 검증 등) | 6시간 | Week 3 안정화 |

**Week 3 완료 기준:**
- 초급 모드에서 필수 항목(별점, 태그) 입력 → 제출 성공
- 고급 모드 토글 → 슬라이더/상세 태그 표시
- 제출 후 Firestore에 저장되고 카페 상세 화면에서 즉시 확인 가능

### Week 4: 마이페이지 + 최종 마무리
**목표:** F-3.1 ~ F-3.3 완성 + TestFlight 배포

| 일차 | 작업 | 예상 시간 | 산출물 |
|------|------|-----------|--------|
| Day 22-23 | 마이페이지 (F-3.1 ~ F-3.3) | 10시간 | 유저 정보, 통계, 내 리뷰 |
| Day 24 | 전체 플로우 테스트 | 4시간 | 모든 화면 동작 검증 |
| Day 25 | UI 폴리싱 (간격, 색상 등) | 4시간 | 디자인 시스템 준수 |
| Day 26-27 | TestFlight 빌드 및 배포 | 6시간 | 베타 테스터 초대 준비 |
| Day 28 | 초기 콘텐츠 입력 시작 | - | 문서 5 (Execution) 시작 |

**Week 4 완료 기준:**
- 마이페이지에서 "총 N잔" 통계 표시
- TestFlight에 빌드 업로드 완료
- 본인이 직접 테스트하여 모든 기능 동작 확인

---

## 3. 상세 구현 체크리스트

### G-0: 공통 및 기반 (Foundation)

#### G-0.2: 네비게이션 (Navigation)

**생성 파일:**
- `src/navigation/AppNavigator.js`
- `src/navigation/TabNavigator.js`

**구현 단계:**

**1단계: TabNavigator 생성**

**파일: `src/navigation/TabNavigator.js`**

```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import MyPageScreen from '../screens/MyPageScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
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
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={{ title: '리뷰 쓰기' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}
```

**2단계: AppNavigator 생성 (Stack + Auth 분기)**

**파일: `src/navigation/AppNavigator.js`**

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';

import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, isFirstLaunch } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 비로그인 상태
          <>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          // 로그인 상태
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="CafeDetail"
              component={CafeDetailScreen}
              options={{
                headerShown: true,
                title: '카페 상세'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**체크리스트:**
- [ ] `TabNavigator.js` 생성 (3개 탭: Home, WriteReview, MyPage)
- [ ] `AppNavigator.js` 생성 (Stack Navigator)
- [ ] 로그인 전/후 화면 분기 로직 구현
- [ ] `CafeDetailScreen` 스택 추가 (카페 리스트에서 이동용)
- [ ] 탭 아이콘 표시 확인 (Ionicons 사용)

---

#### G-0.3: 인증 (Authentication)

**생성 파일:**
- `src/contexts/AuthContext.js`
- `src/screens/LoginScreen.js`

**구현 단계:**

**1단계: AuthContext 생성 (전역 상태 관리)**

**파일: `src/contexts/AuthContext.js`**

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 첫 실행 여부 확인
    checkFirstLaunch();

    // Firebase Auth 상태 변화 리스너
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('첫 실행 확인 오류:', error);
      setIsFirstLaunch(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  };

  const loginWithApple = async (identityToken) => {
    try {
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
      });
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.error('Apple 로그인 오류:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  const value = {
    user,
    isFirstLaunch,
    loading,
    loginWithGoogle,
    loginWithApple,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**2단계: 로그인 화면 구현**

**파일: `src/screens/LoginScreen.js`**

```javascript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [loading, setLoading] = useState(false);

  // Google 로그인 설정 (Expo Auth Session)
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      setLoading(true);
      await loginWithGoogle(idToken);
    } catch (error) {
      Alert.alert('로그인 실패', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      await loginWithApple(credential.identityToken);
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('로그인 실패', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeanLog</Text>
      <Text style={styles.subtitle}>커피 맛, 기록하고 발견하세요</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => promptAsync()}
          disabled={loading || !request}
        >
          <Text style={styles.buttonText}>Google로 시작하기</Text>
        </TouchableOpacity>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={handleAppleLogin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 36,
    color: COLORS.brand,
    marginBottom: 10,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
});
```

**3단계: App.js에 AuthProvider 적용**

**파일: `App.js`**

```javascript
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

**체크리스트:**
- [ ] `AuthContext.js` 생성 (user 상태, login/logout 함수)
- [ ] AsyncStorage 설치 (`expo install @react-native-async-storage/async-storage`)
- [ ] `LoginScreen.js` 생성 (Google, Apple 로그인 버튼)
- [ ] Firebase 콘솔에서 Google/Apple OAuth 설정 완료
- [ ] `App.js`에 `<AuthProvider>` 래핑
- [ ] 로그인 → 바텀 탭 화면 이동 동작 확인

**참고:** Google/Apple 로그인은 실제 디바이스나 시뮬레이터에서만 정상 동작합니다.

---

#### G-0.4: 온보딩 (Onboarding)

**생성 파일:**
- `src/screens/OnboardingScreen.js`

**구현 단계:**

**파일: `src/screens/OnboardingScreen.js`**

```javascript
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: '커피 맛, 쉽게 기록하세요',
    description: '초급 모드와 고급 모드로\n나만의 커피 취향을 남겨보세요',
  },
  {
    title: '다른 사람의 리뷰를 확인하세요',
    description: '같은 카페를 다녀온 사람들의\n진짜 맛 평가를 읽어보세요',
  },
  {
    title: '나만의 커피 여정을 만들어요',
    description: '마신 커피의 기록이 쌓이면\n나의 취향이 보입니다',
  },
];

export default function OnboardingScreen({ navigation }) {
  const swiperRef = useRef(null);

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </Swiper>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dot: {
    backgroundColor: COLORS.disabled,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.accent,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  skipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});
```

**체크리스트:**
- [ ] `react-native-swiper` 설치 확인
- [ ] `OnboardingScreen.js` 생성 (3페이지 스와이프)
- [ ] [시작하기] 버튼 터치 시 LoginScreen으로 이동
- [ ] 앱 첫 실행 시에만 표시되고, 이후 실행 시 스킵 (AuthContext의 `isFirstLaunch` 활용)

---

#### G-0.5: 상태 처리 (State Handling)

**생성 파일:**
- `src/components/LoadingSpinner.js`
- `src/components/EmptyState.js`

**1) LoadingSpinner 컴포넌트**

**파일: `src/components/LoadingSpinner.js`**

```javascript
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
```

**2) EmptyState 컴포넌트**

**파일: `src/components/EmptyState.js`**

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function EmptyState({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
```

**체크리스트:**
- [ ] `LoadingSpinner.js` 생성
- [ ] `EmptyState.js` 생성
- [ ] 데이터 로딩 중: `<LoadingSpinner />` 표시
- [ ] 데이터 없을 시: `<EmptyState message="리뷰가 없습니다" />` 표시

---

### F-1: 카페 리스트 및 상세

#### F-1.1: 카페 리스트 스크린 (홈 탭)

**생성 파일:**
- `src/screens/HomeScreen.js`
- `src/components/CafeListItem.js`

**구현 단계:**

**1단계: Firestore에서 카페 데이터 가져오기**

**파일: `src/services/cafeService.js`** (새로 생성)

```javascript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const getAllCafes = async () => {
  try {
    const cafesRef = collection(db, 'cafes');
    const snapshot = await getDocs(cafesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('카페 목록 가져오기 오류:', error);
    throw error;
  }
};

export const getCafesByLocation = async (locationTag) => {
  try {
    const cafesRef = collection(db, 'cafes');
    const q = query(cafesRef, where('locationTags', 'array-contains', locationTag));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('카페 필터링 오류:', error);
    throw error;
  }
};
```

**2단계: 카페 리스트 아이템 컴포넌트**

**파일: `src/components/CafeListItem.js`**

```javascript
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function CafeListItem({ cafe, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: cafe.thumbnailUrl }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{cafe.name}</Text>
        <Text style={styles.location}>
          {cafe.locationTags ? cafe.locationTags.join(' • ') : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.disabled,
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  location: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
```

**3단계: 홈 스크린 (리스트 + 필터)**

**파일: `src/screens/HomeScreen.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { getAllCafes, getCafesByLocation } from '../services/cafeService';
import CafeListItem from '../components/CafeListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const LOCATION_FILTERS = ['전체', '성수', '연남', '강남', '종로', '홍대'];

export default function HomeScreen({ navigation }) {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('전체');

  useEffect(() => {
    loadCafes();
  }, [selectedFilter]);

  const loadCafes = async () => {
    try {
      setLoading(true);
      let data;
      if (selectedFilter === '전체') {
        data = await getAllCafes();
      } else {
        data = await getCafesByLocation(selectedFilter);
      }
      setCafes(data);
    } catch (error) {
      console.error('카페 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetail', { cafeId: cafe.id });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* 지역 필터 */}
      <View style={styles.filterContainer}>
        {LOCATION_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 카페 리스트 */}
      {cafes.length === 0 ? (
        <EmptyState message="카페가 없습니다" />
      ) : (
        <FlatList
          data={cafes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CafeListItem cafe={item} onPress={() => handleCafePress(item)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterText: {
    ...TYPOGRAPHY.tag,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.background,
  },
});
```

**체크리스트:**
- [ ] `cafeService.js` 생성 (Firestore 쿼리 함수)
- [ ] `CafeListItem.js` 생성 (썸네일, 이름, 지역 표시)
- [ ] `HomeScreen.js` 생성 (지역 필터 + FlatList)
- [ ] Firestore `cafes` 컬렉션에 테스트 데이터 3~5개 수동 입력
- [ ] 지역 필터 터치 시 카페 목록 변경 확인
- [ ] 카페 아이템 터치 시 `CafeDetailScreen`으로 이동 (cafeId 전달)

---

#### F-1.2: 카페 상세 스크린

**생성 파일:**
- `src/screens/CafeDetailScreen.js`
- `src/components/ReviewListItem.js`
- `src/services/reviewService.js`

**구현 단계:**

**1단계: 리뷰 서비스 로직**

**파일: `src/services/reviewService.js`**

```javascript
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const getReviewsByCafe = async (cafeId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('cafeId', '==', cafeId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    throw error;
  }
};

export const getReviewsByUser = async (userId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('내 리뷰 가져오기 오류:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const docRef = await addDoc(reviewsRef, {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('리뷰 생성 오류:', error);
    throw error;
  }
};
```

**2단계: 리뷰 아이템 컴포넌트**

**파일: `src/components/ReviewListItem.js`**

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function ReviewListItem({ review }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{review.userName || '익명'}</Text>
        <Rating
          type="star"
          ratingCount={5}
          imageSize={16}
          readonly
          startingValue={review.rating}
          tintColor={COLORS.background}
        />
      </View>

      <View style={styles.tags}>
        {review.basicTags && review.basicTags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {review.comment && (
        <Text style={styles.comment}>{review.comment}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    ...TYPOGRAPHY.tag,
    color: COLORS.background,
  },
  comment: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
```

**3단계: 카페 상세 스크린**

**파일: `src/screens/CafeDetailScreen.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getReviewsByCafe } from '../services/reviewService';
import ReviewListItem from '../components/ReviewListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function CafeDetailScreen({ route }) {
  const { cafeId } = route.params;
  const [cafe, setCafe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCafeData();
  }, [cafeId]);

  const loadCafeData = async () => {
    try {
      setLoading(true);

      // 카페 정보 로드
      const cafeDoc = await getDoc(doc(db, 'cafes', cafeId));
      if (cafeDoc.exists()) {
        setCafe({ id: cafeDoc.id, ...cafeDoc.data() });
      }

      // 리뷰 로드
      const reviewsData = await getReviewsByCafe(cafeId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('카페 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cafe) {
    return <EmptyState message="카페 정보를 찾을 수 없습니다" />;
  }

  // 평균 평점 계산
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <View style={styles.container}>
      {/* 카페 정보 */}
      <View style={styles.cafeInfo}>
        <Text style={styles.cafeName}>{cafe.name}</Text>
        <Text style={styles.address}>{cafe.address}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>평균 평점: {avgRating}점</Text>
          <Text style={styles.statsText}>리뷰 {reviews.length}개</Text>
        </View>
      </View>

      {/* 리뷰 리스트 */}
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>리뷰</Text>
        {reviews.length === 0 ? (
          <EmptyState message="첫 리뷰를 작성해보세요" />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReviewListItem review={item} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cafeInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cafeName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  address: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  reviewSection: {
    flex: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
```

**체크리스트:**
- [ ] `reviewService.js` 생성 (리뷰 쿼리 함수)
- [ ] `ReviewListItem.js` 생성 (별점, 태그, 코멘트 표시)
- [ ] `CafeDetailScreen.js` 생성 (카페 정보 + 리뷰 리스트)
- [ ] Firestore `reviews` 컬렉션에 테스트 데이터 2~3개 수동 입력
- [ ] 카페 상세 화면에서 평균 평점 계산 확인
- [ ] 리뷰 리스트가 최신순으로 표시되는지 확인

---

### F-2: 리뷰 작성 (Core Feature) ⭐

#### F-2.1 ~ F-2.4: 리뷰 작성 폼

**생성 파일:**
- `src/screens/WriteReviewScreen.js`
- `src/components/StarRating.js`
- `src/components/Tag.js`

**구현 단계:**

**1단계: 재사용 컴포넌트 - StarRating**

**파일: `src/components/StarRating.js`**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings';
import { COLORS } from '../constants/colors';

export default function StarRating({ value, onChange, readonly = false }) {
  return (
    <View style={styles.container}>
      <Rating
        type="star"
        ratingCount={5}
        imageSize={40}
        readonly={readonly}
        startingValue={value}
        onFinishRating={onChange}
        tintColor={COLORS.background}
        ratingColor={COLORS.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
```

**2단계: 재사용 컴포넌트 - Tag**

**파일: `src/components/Tag.js`**

```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function Tag({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tagSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  text: {
    ...TYPOGRAPHY.tag,
    color: COLORS.textSecondary,
  },
  textSelected: {
    color: COLORS.background,
  },
});
```

**3단계: 리뷰 작성 화면 (초급 + 고급 모드)**

**파일: `src/screens/WriteReviewScreen.js`**

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from '../contexts/AuthContext';
import { createReview } from '../services/reviewService';
import StarRating from '../components/StarRating';
import Tag from '../components/Tag';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

const BASIC_TAGS = ['#상큼한', '#고소한', '#달콤한', '#묵직한', '#부드러운', '#꽃향기'];
const ADVANCED_TAGS = ['#시트러스', '#초콜릿', '#견과류', '#베리', '#캐러멜', '#허브'];
const ROASTING_OPTIONS = ['Light', 'Medium', 'Dark'];

export default function WriteReviewScreen({ navigation, route }) {
  const { user } = useAuth();
  const { cafeId, cafeName } = route.params || {};

  // 초급 모드
  const [rating, setRating] = useState(3);
  const [selectedBasicTags, setSelectedBasicTags] = useState([]);
  const [comment, setComment] = useState('');

  // 고급 모드
  const [advancedMode, setAdvancedMode] = useState(false);
  const [acidity, setAcidity] = useState(3);
  const [body, setBody] = useState(3);
  const [selectedAdvancedTags, setSelectedAdvancedTags] = useState([]);
  const [roasting, setRoasting] = useState('Medium');

  const [submitting, setSubmitting] = useState(false);

  const toggleBasicTag = (tag) => {
    if (selectedBasicTags.includes(tag)) {
      setSelectedBasicTags(selectedBasicTags.filter(t => t !== tag));
    } else {
      setSelectedBasicTags([...selectedBasicTags, tag]);
    }
  };

  const toggleAdvancedTag = (tag) => {
    if (selectedAdvancedTags.includes(tag)) {
      setSelectedAdvancedTags(selectedAdvancedTags.filter(t => t !== tag));
    } else {
      setSelectedAdvancedTags([...selectedAdvancedTags, tag]);
    }
  };

  const validateForm = () => {
    if (!cafeId) {
      Alert.alert('오류', '카페를 선택해주세요');
      return false;
    }
    if (selectedBasicTags.length === 0) {
      Alert.alert('필수 항목', '최소 1개의 맛 태그를 선택해주세요');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const reviewData = {
        userId: user.uid,
        userName: user.displayName,
        cafeId: cafeId,
        rating: rating,
        basicTags: selectedBasicTags,
        comment: comment || null,
        acidity: advancedMode ? acidity : null,
        body: advancedMode ? body : null,
        advancedTags: advancedMode ? selectedAdvancedTags : null,
        roasting: advancedMode ? roasting : null,
      };

      await createReview(reviewData);
      Alert.alert('완료', '리뷰가 등록되었습니다!');
      navigation.navigate('CafeDetail', { cafeId });
    } catch (error) {
      Alert.alert('오류', '리뷰 등록에 실패했습니다');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>어떤 커피였나요?</Text>
        <StarRating value={rating} onChange={setRating} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>맛은 어땠나요? (필수)</Text>
        <View style={styles.tagContainer}>
          {BASIC_TAGS.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              selected={selectedBasicTags.includes(tag)}
              onPress={() => toggleBasicTag(tag)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>한 줄 남기기 (선택)</Text>
        <TextInput
          style={styles.input}
          placeholder="커피에 대한 생각을 남겨보세요"
          placeholderTextColor={COLORS.textSecondary}
          value={comment}
          onChangeText={setComment}
          maxLength={100}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setAdvancedMode(!advancedMode)}
      >
        <Text style={styles.advancedToggleText}>
          {advancedMode ? '- 간단하게 남기기' : '+ 상세하게 남기기'}
        </Text>
      </TouchableOpacity>

      {advancedMode && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>산미 (Acidity)</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={acidity}
              onValueChange={setAcidity}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.disabled}
            />
            <Text style={styles.sliderValue}>{acidity} / 5</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>바디 (Body)</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={body}
              onValueChange={setBody}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.disabled}
            />
            <Text style={styles.sliderValue}>{body} / 5</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상세 향 (Flavor Notes)</Text>
            <View style={styles.tagContainer}>
              {ADVANCED_TAGS.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  selected={selectedAdvancedTags.includes(tag)}
                  onPress={() => toggleAdvancedTag(tag)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>로스팅 (Roasting)</Text>
            <View style={styles.roastingContainer}>
              {ROASTING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.roastingButton,
                    roasting === option && styles.roastingButtonSelected,
                  ]}
                  onPress={() => setRoasting(option)}
                >
                  <Text
                    style={[
                      styles.roastingText,
                      roasting === option && styles.roastingTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? '등록 중...' : '작성 완료'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  input: {
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  advancedToggle: {
    padding: 20,
    alignItems: 'center',
  },
  advancedToggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  roastingContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roastingButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  roastingButtonSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  roastingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  roastingTextSelected: {
    color: COLORS.background,
  },
  submitButton: {
    margin: 20,
    padding: 18,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});
```

**체크리스트:**
- [ ] `StarRating.js` 생성 (별점 컴포넌트)
- [ ] `Tag.js` 생성 (선택 가능한 태그 컴포넌트)
- [ ] `WriteReviewScreen.js` 생성 (초급 + 고급 모드)
- [ ] 초급 모드: 별점, 맛 태그(필수), 한 줄 코멘트(선택) 입력 확인
- [ ] 고급 모드 토글: "+" 버튼 터치 시 슬라이더/상세 태그 확장 확인
- [ ] 필수 항목(맛 태그) 미입력 시 Alert 표시
- [ ] [작성 완료] 버튼 터치 시 Firestore `reviews` 컬렉션에 저장
- [ ] 저장 후 `CafeDetailScreen`으로 자동 이동하여 방금 쓴 리뷰 즉시 확인

**참고:** 현재 버전에서는 리뷰 작성 전 "카페 선택" 화면 없이, `HomeScreen`에서 카페 터치 → `CafeDetailScreen` → "리뷰 쓰기" 버튼 추가 방식으로 진입합니다. `route.params`로 `cafeId`를 받아 처리합니다.

---

### F-3: 마이페이지 (Retention)

#### F-3.1 ~ F-3.3: 마이페이지

**생성 파일:**
- `src/screens/MyPageScreen.js`

**구현 단계:**

**파일: `src/screens/MyPageScreen.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByUser } from '../services/reviewService';
import ReviewListItem from '../components/ReviewListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

export default function MyPageScreen() {
  const { user, logout } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyReviews();
    }
  }, [user]);

  const loadMyReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviewsByUser(user.uid);
      setReviews(data);
    } catch (error) {
      console.error('내 리뷰 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 가장 많이 사용한 태그 계산
  const getFavoriteTag = () => {
    if (reviews.length === 0) return '-';

    const tagCounts = {};
    reviews.forEach(review => {
      if (review.basicTags) {
        review.basicTags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    return sortedTags.length > 0 ? sortedTags[0][0] : '-';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* 상단: 유저 정보 */}
      <View style={styles.header}>
        <Text style={styles.userName}>{user?.displayName || '익명'}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 간단한 통계 */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviews.length}잔</Text>
          <Text style={styles.statLabel}>총 커피</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getFavoriteTag()}</Text>
          <Text style={styles.statLabel}>원픽 맛</Text>
        </View>
      </View>

      {/* 내 리뷰 목록 */}
      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>내 리뷰</Text>
        {reviews.length === 0 ? (
          <EmptyState message="아직 작성한 리뷰가 없습니다" />
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ReviewListItem review={item} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    padding: 30,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.brand,
    marginBottom: 5,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  reviewSection: {
    flex: 1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    padding: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
```

**체크리스트:**
- [ ] `MyPageScreen.js` 생성
- [ ] 상단: 유저 닉네임 + [로그아웃] 버튼 표시
- [ ] 통계: "총 N잔", "원픽 맛: #태그" 표시
- [ ] 내 리뷰 목록: `getReviewsByUser()` 호출하여 FlatList 렌더링
- [ ] 로그아웃 버튼 터치 시 Firebase Auth 로그아웃 → LoginScreen으로 이동
- [ ] 리뷰 0개일 때 EmptyState 표시

---

## 4. Firebase 구성 상세

### 4.1. Firestore 컬렉션 구조

**컬렉션 1: `users`**

```
users/
  └─ {uid} (Document)
       ├─ email: "test@gmail.com"
       ├─ displayName: "커피왕"
       └─ createdAt: Timestamp
```

**설명:** Firebase Authentication으로 로그인한 유저 정보. 별도로 생성하지 않아도 `auth.currentUser`에서 접근 가능하므로, v0.1에서는 이 컬렉션을 생략해도 무방합니다.

---

**컬렉션 2: `cafes`**

```
cafes/
  └─ {auto-id} (Document)
       ├─ name: "블루보틀 성수"
       ├─ address: "서울시 성동구..."
       ├─ locationTags: ["서울", "성수"]
       └─ thumbnailUrl: "https://example.com/image.png"
```

**수동 입력 방법 (Firebase 콘솔):**

1. Firebase 콘솔 → Firestore Database → 컬렉션 시작
2. 컬렉션 ID: `cafes`
3. 문서 ID: 자동 ID
4. 필드 추가:
   - `name` (string): "블루보틀 성수"
   - `address` (string): "서울시 성동구 성수동2가 273-1"
   - `locationTags` (array): ["서울", "성수"]
   - `thumbnailUrl` (string): 임시 이미지 URL (Unsplash 등)

**초기 30개 카페 입력 시간:** 약 2~3시간 소요 (문서 5의 콘텐츠 확보 계획 참고)

---

**컬렉션 3: `reviews`**

```
reviews/
  └─ {auto-id} (Document)
       ├─ userId: "uid-12345"
       ├─ userName: "커피왕"
       ├─ cafeId: "cafe-abcde"
       ├─ createdAt: Timestamp
       ├─ rating: 4
       ├─ basicTags: ["#고소한", "#부드러운"]
       ├─ comment: "라떼가 정말 고소해요"
       ├─ acidity: 4 (nullable)
       ├─ body: 2 (nullable)
       ├─ advancedTags: ["#꽃향기", "#시트러스"] (nullable)
       └─ roasting: "Light" (nullable)
```

**앱에서 자동 생성:** `createReview()` 함수 호출 시 Firestore에 자동 저장.

---

### 4.2. Firestore 색인 (Indexes) 생성

**필수 색인 (Composite Indexes):**

리뷰 쿼리 시 `where` + `orderBy`를 함께 사용하므로, Firebase가 자동으로 색인 생성을 요구합니다.

**필요한 색인:**

1. **카페별 리뷰 (최신순):**
   - Collection: `reviews`
   - Fields: `cafeId` (Ascending), `createdAt` (Descending)

2. **내 리뷰 (최신순):**
   - Collection: `reviews`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

**색인 생성 방법:**

**Option 1: 자동 생성 (권장)**
- 앱을 실행하여 리뷰 목록을 불러올 때, Firestore가 오류 메시지와 함께 색인 생성 링크를 제공합니다.
- 해당 링크를 클릭하면 자동으로 색인이 생성됩니다.

**Option 2: 수동 생성**
- Firebase 콘솔 → Firestore Database → 색인 탭
- [복합 쿼리 색인 추가] 클릭
- 위 필드 정보를 입력하여 생성

---

### 4.3. Firestore 보안 규칙 (Security Rules)

**개발 중 (테스트 모드):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 읽기/쓰기 허용 (임시)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**주의:** 테스트 모드는 30일 후 자동 만료되므로, TestFlight 배포 전에 아래 규칙으로 변경해야 합니다.

---

**배포 전 (프로덕션):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // cafes: 모든 사람이 읽기 가능, 쓰기는 불가
    match /cafes/{cafeId} {
      allow read: if true;
      allow write: if false;
    }

    // reviews: 로그인한 사람만 작성 가능, 모든 사람이 읽기 가능
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

**규칙 설명:**
- `cafes`: 카페 정보는 모든 사람이 읽을 수 있지만, 수정은 Firebase 콘솔에서만 가능
- `reviews`: 리뷰는 로그인한 사람만 작성 가능하며, 본인이 쓴 리뷰만 수정/삭제 가능

---

### 4.4. Authentication 설정

**Google 로그인:**

1. Firebase 콘솔 → Authentication → Sign-in method
2. Google 활성화
3. 프로젝트 지원 이메일 입력
4. Expo에서 OAuth 설정:
   - `app.json`에 Google Client ID 추가
   - `expo install expo-auth-session expo-web-browser`
   - Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성 (iOS, Android 각각)

**Apple 로그인:**

1. Firebase 콘솔 → Authentication → Sign-in method
2. Apple 활성화
3. Apple Developer에서 Sign in with Apple 활성화
4. Expo 설정:
   - `expo install expo-apple-authentication`
   - `app.json`에 `usesAppleSignIn: true` 추가

**참고:** Apple 로그인은 iOS 실제 디바이스에서만 동작합니다.

---

## 5. 컴포넌트 개발 가이드

### 5.1. 공통 컴포넌트 목록

| 컴포넌트 | 경로 | 용도 | Props |
|---------|------|------|-------|
| `LoadingSpinner` | `src/components/LoadingSpinner.js` | 로딩 상태 표시 | 없음 |
| `EmptyState` | `src/components/EmptyState.js` | 데이터 없음 표시 | `message` (string) |
| `StarRating` | `src/components/StarRating.js` | 별점 입력/표시 | `value`, `onChange`, `readonly` |
| `Tag` | `src/components/Tag.js` | 선택 가능한 태그 | `label`, `selected`, `onPress` |
| `CafeListItem` | `src/components/CafeListItem.js` | 카페 리스트 아이템 | `cafe`, `onPress` |
| `ReviewListItem` | `src/components/ReviewListItem.js` | 리뷰 리스트 아이템 | `review` |

### 5.2. 컴포넌트 사용 예시

**StarRating (별점 입력)**

```javascript
<StarRating
  value={rating}
  onChange={(value) => setRating(value)}
/>
```

**Tag (태그 선택)**

```javascript
<Tag
  label="#고소한"
  selected={selectedTags.includes('#고소한')}
  onPress={() => toggleTag('#고소한')}
/>
```

**EmptyState (데이터 없음)**

```javascript
{data.length === 0 && (
  <EmptyState message="리뷰가 없습니다" />
)}
```

### 5.3. 스타일링 규칙

**1) 모든 색상은 `COLORS` 상수 사용**

```javascript
// Good
backgroundColor: COLORS.background

// Bad
backgroundColor: '#FFFFFF'
```

**2) 모든 텍스트는 `TYPOGRAPHY` 상수 사용**

```javascript
// Good
<Text style={{ ...TYPOGRAPHY.h1, color: COLORS.brand }}>제목</Text>

// Bad
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>제목</Text>
```

**3) 간격 (Spacing) 규칙**

- `padding`: 15px, 20px (작은 여백, 큰 여백)
- `margin`: 10px, 15px, 20px
- `gap`: 10px (flexbox 간격)

**4) 버튼 스타일 (2가지)**

```javascript
// Primary 버튼
{
  backgroundColor: COLORS.accent,
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
}

// Secondary 버튼
{
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: COLORS.border,
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
}
```

---

## 6. 테스트 체크리스트

### 6.1. 기능별 테스트 시나리오

**인증 (Authentication)**
- [ ] Google 로그인 버튼 터치 → Google 계정 선택 → 앱 진입
- [ ] Apple 로그인 버튼 터치 → Face ID/Touch ID → 앱 진입
- [ ] 로그인 후 마이페이지 → [로그아웃] → 다시 로그인 화면으로 이동
- [ ] 앱 첫 실행 시 온보딩 화면 표시 → 두 번째 실행 시 스킵

**카페 리스트 (F-1.1)**
- [ ] 홈 탭 진입 시 카페 30개 리스트 표시
- [ ] 지역 필터 (성수/연남 등) 터치 시 필터링된 카페만 표시
- [ ] "전체" 필터 터치 시 모든 카페 다시 표시
- [ ] 카페 아이템 터치 시 카페 상세 화면으로 이동

**카페 상세 (F-1.2)**
- [ ] 카페 이름, 주소, 평균 평점, 리뷰 개수 표시
- [ ] 리뷰 리스트가 최신순으로 정렬되어 표시
- [ ] 리뷰가 0개일 때 "첫 리뷰를 작성해보세요" 메시지 표시

**리뷰 작성 (F-2)**
- [ ] [리뷰 쓰기] 탭 터치 → 리뷰 작성 화면 진입
- [ ] 별점 선택 (1~5점)
- [ ] 맛 태그 최소 1개 선택 (필수)
- [ ] 한 줄 코멘트 입력 (선택)
- [ ] [+ 상세하게 남기기] 터치 → 슬라이더/상세 태그 확장
- [ ] 산미/바디 슬라이더 조절 (1~5점)
- [ ] 상세 향 태그 선택
- [ ] 로스팅 옵션 선택 (Light/Medium/Dark)
- [ ] [작성 완료] 버튼 터치 → Firestore에 저장
- [ ] 저장 후 카페 상세 화면으로 이동 → 방금 쓴 리뷰 즉시 표시

**마이페이지 (F-3)**
- [ ] 마이페이지 진입 시 유저 닉네임 표시
- [ ] "총 N잔" 통계 정확히 표시
- [ ] "원픽 맛" 태그 정확히 계산 (가장 많이 사용한 태그)
- [ ] 내 리뷰 리스트 최신순 표시
- [ ] 리뷰 0개일 때 "아직 작성한 리뷰가 없습니다" 표시

### 6.2. 엣지 케이스 (Edge Cases)

**데이터 없음**
- [ ] 카페 0개일 때 홈 화면 표시
- [ ] 리뷰 0개인 카페 상세 화면 표시
- [ ] 내 리뷰 0개일 때 마이페이지 표시

**필수 항목 검증**
- [ ] 리뷰 작성 시 맛 태그 미선택 → Alert 표시
- [ ] 별점 0점일 때 제출 시도 → Alert 표시 (또는 기본값 3점 설정)

**네트워크 오류**
- [ ] 인터넷 연결 없을 때 Firestore 쿼리 실패 → 에러 메시지 표시
- [ ] 이미지 로드 실패 시 회색 placeholder 표시

**로딩 상태**
- [ ] 카페 리스트 로딩 중 LoadingSpinner 표시
- [ ] 리뷰 제출 중 버튼 비활성화 + "등록 중..." 텍스트 표시

### 6.3. UI/UX 테스트

**색상 일관성**
- [ ] 모든 화면에서 `COLORS` 상수 사용 확인
- [ ] 브랜드 컬러 (#6F4E37)가 로고, 주요 아이콘에 적용
- [ ] 액센트 컬러 (#D4A276)가 선택된 탭, 버튼에 적용

**타이포그래피 일관성**
- [ ] 제목은 H1 (24px, Bold)
- [ ] 서브 제목은 H2 (18px, SemiBold)
- [ ] 본문은 Body (16px, Regular)

**터치 가능 영역**
- [ ] 모든 버튼의 터치 영역 충분 (최소 44x44pt)
- [ ] 태그/필터 버튼 터치 시 즉시 반응

**스크롤**
- [ ] 카페 리스트 스크롤 부드럽게 동작
- [ ] 리뷰 작성 화면 (고급 모드 확장 시) 스크롤 가능
- [ ] 리뷰 리스트 스크롤 시 성능 저하 없음

---

## 7. 배포 준비

### 7.1. TestFlight 빌드 준비

**1단계: app.json 설정 확인**

```json
{
  "expo": {
    "name": "BeanLog",
    "slug": "beanlog",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6F4E37"
    },
    "ios": {
      "bundleIdentifier": "com.yourname.beanlog",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "프로필 사진을 위해 카메라 접근이 필요합니다 (v0.2 이후)",
        "NSPhotoLibraryUsageDescription": "프로필 사진을 위해 사진첩 접근이 필요합니다 (v0.2 이후)"
      }
    },
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

**2단계: Expo 빌드**

```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# EAS 프로젝트 설정
eas build:configure

# iOS 빌드 (TestFlight용)
eas build --platform ios --profile production
```

**3단계: TestFlight 업로드**

- Expo가 자동으로 .ipa 파일을 App Store Connect에 업로드합니다.
- App Store Connect → TestFlight → 빌드 확인
- [테스트 정보] 입력 (수출 규정 준수 등)
- 베타 테스터 초대 (이메일 또는 공개 링크)

### 7.2. Pre-Launch 체크리스트

**코드 품질**
- [ ] 콘솔 에러/경고 0개
- [ ] 미사용 import 제거
- [ ] 하드코딩된 값 (API 키 등) 환경 변수로 분리
- [ ] `console.log()` 디버깅 코드 제거 또는 주석 처리

**Firebase 설정**
- [ ] Firestore 보안 규칙을 프로덕션 모드로 변경 (4.3 참고)
- [ ] Firestore 색인 생성 완료 (4.2 참고)
- [ ] Firebase Authentication Google/Apple 로그인 활성화
- [ ] Firebase 프로젝트 요금제 확인 (Spark 무료 플랜 한도 체크)

**초기 콘텐츠**
- [ ] Firestore `cafes` 컬렉션에 30개 카페 입력 완료
- [ ] Firestore `reviews` 컬렉션에 100개 리뷰 입력 완료 (문서 5 참고)
- [ ] 카페 썸네일 이미지 URL 유효성 확인

**디자인**
- [ ] 앱 아이콘 (1024x1024) 준비 (`assets/icon.png`)
- [ ] 스플래시 화면 이미지 준비 (`assets/splash.png`)
- [ ] 모든 화면에서 Safe Area 적용 확인 (아이폰 노치 대응)

**법적 준비**
- [ ] 개인정보 처리방침 URL 준비 (App Store 제출 시 필수)
- [ ] 서비스 이용약관 URL 준비 (선택사항)

### 7.3. 베타 테스터 초대 계획

**1) TestFlight 공개 링크 생성**
- App Store Connect → TestFlight → 공개 링크 생성
- 최대 10,000명 초대 가능

**2) 베타 테스터 모집 메시지 (템플릿)**

```
[BeanLog 베타 테스터 모집]

안녕하세요! 커피 맛 리뷰 앱 'BeanLog'의 첫 베타 버전이 준비되었습니다.

📱 BeanLog란?
- 카페의 '커피 맛'만 집중적으로 리뷰하는 앱
- 초급 모드와 고급 모드로 누구나 쉽게 리뷰 작성
- 나만의 커피 취향 데이터 축적

🎯 베타 테스터 혜택:
- 정식 런칭 전 모든 기능 무료 체험
- 피드백 반영 시 크레딧 제공
- 추후 프리미엄 기능 평생 무료 (검토 중)

📝 참여 방법:
1. TestFlight 링크 접속: [링크]
2. 앱 설치 후 최소 3개 이상 리뷰 작성
3. 피드백은 [오픈카톡방/디스코드] 링크로 전달

✅ 모집 인원: 30명 (선착순)
✅ 기간: 11월 25일 ~ 12월 31일

커피 덕후 여러분의 많은 참여 부탁드립니다!
```

**3) 피드백 채널 운영**
- [ ] 오픈카톡방 또는 디스코드 채널 개설
- [ ] 피드백 수집 양식 (Google Forms 등) 준비
- [ ] 주 1회 피드백 정리 및 응답

---

## 8. 마무리 및 다음 단계

### 8.1. v0.1 완료 기준

**필수 기능 동작 확인:**
- [ ] 로그인 → 홈 → 카페 상세 → 리뷰 쓰기 → 마이페이지 전체 플로우 동작
- [ ] Firestore에 카페 30개, 리뷰 100개 입력 완료
- [ ] TestFlight 빌드 업로드 완료
- [ ] 베타 테스터 30명 초대 완료

**Week 4 종료 시 체크:**
- [ ] 모든 In-Scope 기능 구현 완료 (문서 2 참고)
- [ ] Out-of-Scope 기능 미구현 확인 (지도, 사진, 검색 등)
- [ ] 본인이 직접 테스트하여 치명적 버그 0개

### 8.2. 12주차 검증 지표 준비

**Phase 1-2 (Weeks 5-12) 동안 추적할 데이터:**

1. **콘텐츠 생성 (지표 1):**
   - 베타 유저 30명의 총 리뷰 수 (목표: 100개 이상)
   - Firestore `reviews` 컬렉션 count 쿼리로 측정

2. **리텐션 (지표 2):**
   - 8주차 가입 유저 중 12주차에도 앱 실행한 비율
   - Firebase Analytics 또는 수동 추적

3. **정성적 피드백 (지표 3):**
   - 오픈카톡방/디스코드의 피드백 수집
   - 긍정/부정 피드백 분류 (문서 5의 Triage Table 활용)

### 8.3. v0.2 계획 (12주 후)

**시나리오 A (성공) 시 개발 항목:**
- 지도 뷰 (Naver/Kakao Map API 연동)
- 리뷰 사진 업로드 (Firebase Storage)
- 카페 상세정보 보강
- 리뷰 수정/삭제 기능

**참고:** 문서 3 (Parking Lot) 참고

---

## 부록: 자주 발생하는 오류 및 해결법

### A. Firebase 관련 오류

**오류: "Firebase: Error (auth/configuration-not-found)"**
- **원인:** `GoogleService-Info.plist` 파일이 프로젝트에 없거나 경로가 잘못됨
- **해결:** 파일을 프로젝트 루트에 정확히 배치하고 `app.json`에서 경로 확인

**오류: "Missing or insufficient permissions"**
- **원인:** Firestore 보안 규칙이 너무 엄격함
- **해결:** 개발 중에는 테스트 모드 사용, 배포 전 프로덕션 규칙 적용

**오류: "The query requires an index"**
- **원인:** `where` + `orderBy` 쿼리 시 Firestore 색인 필요
- **해결:** 오류 메시지의 링크 클릭하여 자동 색인 생성

### B. React Native 관련 오류

**오류: "Invariant Violation: Element type is invalid"**
- **원인:** import/export 오타 또는 컴포넌트 이름 불일치
- **해결:** import 경로와 컴포넌트 이름 다시 확인

**오류: "Can't find variable: Blob"**
- **원인:** Firebase v9에서 Blob polyfill 필요
- **해결:** `import 'react-native-get-random-values'` 추가 (firebase.js 상단)

**오류: "Network request failed"**
- **원인:** iOS 시뮬레이터에서 localhost 접근 불가
- **해결:** 실제 Firestore 사용 시 문제 없음, 테스트 데이터 확인

### C. Expo 관련 오류

**오류: "Unable to resolve module"**
- **원인:** npm 패키지 설치 누락
- **해결:** `npm install` 또는 `expo install [패키지명]` 재실행

**오류: "Expo Go app doesn't support custom native code"**
- **원인:** Firebase/Apple Auth는 Expo Go 미지원
- **해결:** `eas build` 사용하여 개발 빌드 생성

---

## 연락처 및 지원

**개발 관련 질문:**
- 이 문서의 체크리스트를 순서대로 따라가세요
- 막히는 부분이 있으면 해당 섹션을 다시 읽어보세요

**추가 리소스:**
- [Expo 공식 문서](https://docs.expo.dev/)
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [React Navigation 공식 문서](https://reactnavigation.org/)

---

**문서 업데이트 이력:**
- v0.1 (2025-11-17): 초안 작성
