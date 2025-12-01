# BeanLog (빈로그)

> 당신의 커피 취향을 기록하고 공유하는 개인 커피 소믈리에 앱

[![Expo](https://img.shields.io/badge/Expo-v54.0.23-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-v0.81.5-brightgreen.svg)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-v12.6.0-orange.svg)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

BeanLog는 커피 애호가들을 위한 모바일 앱으로, 카페 방문 기록과 커피 테이스팅 노트를 작성하고 다른 사람들과 공유할 수 있습니다. 산미, 바디, 향 등 5가지 지표로 정교한 커피 맛 프로필을 기록하고, 지도 기반으로 주변 카페를 탐색할 수 있습니다.

## 주요 기능

### 🎯 테이스팅 노트
- **5단계 맛 프로필**: 산미, 단맛, 바디, 쓴맛, 향을 슬라이더로 평가
- **맛 태그**: 상큼한, 고소한, 달콤한, 묵직한, 부드러운, 꽃향기, 시트러스, 초콜릿, 견과류, 베리, 스파이시 등 11가지
- **로스팅 레벨**: Light/Medium/Dark 선택
- **레이더 차트 시각화**: 맛 프로필을 한눈에 확인
- **별점 및 한 줄 코멘트**: 간단한 평가와 메모
- **사진 업로드**: 다중 이미지 첨부

### 🗺️ 지도 기반 카페 탐색
- **네이버 지도 통합**: 정확한 위치 정보와 길찾기
- **GPS 기반 "내 주변" 검색**: 현재 위치 근처 카페 발견
- **카페명/주소 검색**: 키워드 기반 검색
- **지도 뷰/리스트 뷰 전환**: 원하는 방식으로 카페 탐색

### 📱 커뮤니티 및 피드
- **전체 피드**: 최신 리뷰 확인 (전체/인기/내 주변)
- **커뮤니티 게시판**: 커피 관련 이야기 공유
- **댓글 및 좋아요**: 다른 사용자들과 소통
- **랭킹 시스템**: 인기 커피와 활발한 리뷰어 발견

### 👤 마이페이지
- **프로필 및 통계**: 마신 총 커피 잔 수, 원픽 맛 태그
- **내 리뷰 목록**: 작성한 모든 리뷰 관리
- **북마크**: 저장한 카페 모아보기
- **다크모드**: 밤 시간 편한 사용성

### 🔐 간편한 인증
- **소셜 로그인**: Google/Apple 계정으로 빠른 가입
- **프로필 편집**: 닉네임, 프로필 사진 설정
- **온보딩**: 초기 사용자를 위한 3단계 소개

## 기술 스택

### 프론트엔드
- **React Native** (v0.81.5) - 크로스플랫폼 모바일 앱
- **Expo** (v54.0.23) - React Native 개발 플랫폼
- **React** (v19.1.0) - UI 라이브러리
- **React Navigation** (v7+) - 앱 네비게이션

### 백엔드
- **Firebase Authentication** - Google/Apple 소셜 로그인
- **Cloud Firestore** - 실시간 NoSQL 데이터베이스
- **Firebase Storage** - 이미지/파일 저장소
- **Firebase Admin** - 백엔드 관리자 권한

### 주요 라이브러리
- **React Native Maps** - 지도 기능
- **Expo Location** - GPS/위치 서비스
- **Expo Image Picker** - 카메라/갤러리 접근
- **React Native SVG** - 레이더 차트 렌더링
- **AsyncStorage** - 로컬 데이터 저장
- **Axios** - 네이버 API 호출

### 외부 API
- **네이버 지도 API** - 지도 및 길찾기
- **네이버 검색 API** - 카페/위치 검색

## 프로젝트 구조

```
/busy-hamilton
├── src/
│   ├── screens/              # UI 화면 (17개)
│   │   ├── FeedHomeScreen.js
│   │   ├── SearchScreen.js
│   │   ├── WriteReviewScreen.js
│   │   ├── LoginScreen.js
│   │   ├── MyPageScreen.js
│   │   └── ...
│   ├── components/           # 재사용 컴포넌트 (12개)
│   │   ├── CoffeeCard.js
│   │   ├── FlavorRadar.js
│   │   ├── NaverMapView.js
│   │   ├── StarRating.js
│   │   └── ...
│   ├── services/             # 비즈니스 로직 (11개)
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── cafeService.js
│   │   ├── reviewService.js
│   │   └── ...
│   ├── contexts/             # 전역 상태 관리
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── navigation/           # 네비게이션 설정
│   │   └── AppNavigator.js
│   └── constants/            # 공통 상수
│       ├── colors.js
│       ├── typography.js
│       └── shadows.js
├── assets/                   # 앱 아이콘/스플래시
├── docs/                     # 개발 문서
├── App.js                    # 앱 진입점
├── app.json                  # Expo 설정
├── firebase.json             # Firebase 설정
├── firestore.rules           # Firestore 보안 규칙
└── package.json              # 의존성 관리
```

## 시작하기

### 사전 요구사항

- **Node.js** (v18 이상)
- **npm** 또는 **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Firebase 프로젝트**: [Firebase Console](https://console.firebase.google.com)에서 생성
- **네이버 클라우드 플랫폼 계정**: 지도 API 키 발급용

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd busy-hamilton
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력합니다:

```env
# Firebase 설정
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# 네이버 API 설정
NAVER_MAP_CLIENT_ID=your_naver_map_client_id
NAVER_SEARCH_CLIENT_ID=your_naver_search_client_id
NAVER_SEARCH_CLIENT_SECRET=your_naver_search_client_secret
```

4. Firebase 설정

Firebase Console에서 프로젝트를 생성한 후:

- **Authentication** 활성화 (Google, Apple 제공자 설정)
- **Firestore Database** 생성 (아시아 리전 권장)
- **Storage** 활성화
- **Firestore Rules** 및 **Storage Rules** 배포:

```bash
# Firestore 보안 규칙 배포
firebase deploy --only firestore:rules

# Storage 보안 규칙 배포
firebase deploy --only storage
```

5. 앱 실행

```bash
# Expo 개발 서버 시작
npm start
# 또는
expo start

# Android 에뮬레이터에서 실행
npm run android

# iOS 시뮬레이터에서 실행 (macOS만 가능)
npm run ios

# 웹 브라우저에서 실행
npm run web
```

## 개발 가이드

### 주요 서비스

#### authService.js
사용자 인증 관련 로직을 처리합니다.

```javascript
import {
  signInWithGoogle,
  signInWithApple,
  signOut,
  getCurrentUser
} from './services/authService';

// Google 로그인
await signInWithGoogle();

// 현재 사용자 정보 가져오기
const user = getCurrentUser();
```

#### cafeService.js
카페 정보 CRUD 및 검색 기능을 제공합니다.

```javascript
import {
  getCafes,
  getCafeById,
  searchCafes,
  getNearbyCafes
} from './services/cafeService';

// 모든 카페 가져오기
const cafes = await getCafes();

// 위치 기반 검색 (반경 5km)
const nearbyCafes = await getNearbyCafes(latitude, longitude, 5000);
```

#### reviewService.js
리뷰 작성, 수정, 삭제 및 조회 기능을 제공합니다.

```javascript
import {
  createReview,
  getReviewsByCafe,
  updateReview,
  deleteReview
} from './services/reviewService';

// 리뷰 작성
const review = await createReview({
  cafeId: 'cafe123',
  coffeeName: '에티오피아 예가체프',
  rating: 4.5,
  flavorProfile: {
    acidity: 4,
    sweetness: 3,
    body: 2,
    bitterness: 2,
    aroma: 5
  },
  tags: ['상큼한', '시트러스', '꽃향기'],
  roastLevel: 'Light',
  comment: '상큼하고 꽃향기가 은은하게 납니다.',
  images: ['image_url_1', 'image_url_2']
});
```

### 주요 컴포넌트

#### FlavorRadar.js
맛 프로필을 레이더 차트로 시각화합니다.

```javascript
import FlavorRadar from './components/FlavorRadar';

<FlavorRadar
  flavorProfile={{
    acidity: 4,
    sweetness: 3,
    body: 2,
    bitterness: 2,
    aroma: 5
  }}
  size={200}
/>
```

#### NaverMapView.js
네이버 지도를 표시하고 마커를 렌더링합니다.

```javascript
import NaverMapView from './components/NaverMapView';

<NaverMapView
  cafes={cafes}
  onMarkerPress={(cafe) => console.log(cafe)}
  userLocation={{ latitude: 37.5665, longitude: 126.9780 }}
/>
```

### Context API 사용

#### AuthContext
인증 상태와 사용자 정보를 전역으로 관리합니다.

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <View>
      <Text>{user?.displayName}</Text>
      <Button title="로그아웃" onPress={signOut} />
    </View>
  );
}
```

#### ThemeContext
다크모드/라이트모드를 전환합니다.

```javascript
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Switch value={isDarkMode} onValueChange={toggleTheme} />
    </View>
  );
}
```

## 데이터베이스 구조 (Firestore)

### users 컬렉션
```javascript
{
  uid: "user123",
  email: "user@example.com",
  displayName: "커피러버",
  photoURL: "https://...",
  createdAt: timestamp,
  totalReviews: 15,
  favoriteTag: "상큼한"
}
```

### cafes 컬렉션
```javascript
{
  id: "cafe123",
  name: "카페 이름",
  address: "서울시 강남구...",
  latitude: 37.5665,
  longitude: 126.9780,
  averageRating: 4.3,
  totalReviews: 42,
  createdAt: timestamp
}
```

### reviews 컬렉션
```javascript
{
  id: "review123",
  userId: "user123",
  cafeId: "cafe123",
  coffeeName: "에티오피아 예가체프",
  rating: 4.5,
  flavorProfile: {
    acidity: 4,
    sweetness: 3,
    body: 2,
    bitterness: 2,
    aroma: 5
  },
  tags: ["상큼한", "시트러스"],
  roastLevel: "Light",
  comment: "상큼하고 좋아요!",
  images: ["url1", "url2"],
  likes: 12,
  createdAt: timestamp
}
```

## 스크립트

```json
{
  "start": "expo start",          // Expo 개발 서버 시작
  "android": "expo run:android",  // Android 앱 실행
  "ios": "expo run:ios",          // iOS 앱 실행
  "web": "expo start --web"       // 웹 버전 실행
}
```

## 보안

### Firestore 보안 규칙
`firestore.rules` 파일에 정의된 규칙:

- 인증된 사용자만 데이터 읽기/쓰기 가능
- 사용자는 본인의 리뷰만 수정/삭제 가능
- 카페 정보는 모든 사용자가 읽을 수 있지만 수정은 관리자만 가능

### Storage 보안 규칙
`storage.rules` 파일에 정의된 규칙:

- 인증된 사용자만 이미지 업로드 가능
- 사용자는 본인이 업로드한 이미지만 삭제 가능
- 이미지 크기 제한 (5MB)

## 기여하기

1. 이 저장소를 Fork합니다.
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의

프로젝트 관련 문의사항이나 버그 리포트는 [Issues](https://github.com/your-repo/issues)에 등록해주세요.

---

**BeanLog**로 당신만의 커피 여정을 기록하세요! ☕
