# The Foundation: 기술/디자인 결정서

**문서 목적:** v0.1 개발의 기술 스택, 데이터베이스 구조, 핵심 디자인 시스템을 확정한다. 모든 코드는 이 문서의 결정을 따른다. 이는 반복적인 결정을 방지하고, 개발의 일관성을 유지하며, 미래의 팀원을 위한 가이드가 된다.

**운영 원칙:**

1. 이 문서에 정의된 스택과 스타일을 준수한다.
2. 새로운 라이브러리 도입이나 DB 스키마 변경은 v0.2 이후, '문서 3 (백로그)'의 검토를 통해서만 진행한다.

---

### 1. 기술 스택 (Tech Stack)

| **구분** | **기술** | **사유 (Why)** |
| --- | --- | --- |
| **App Framework** | **React Native (Expo)** | 1인 개발, 빠른 셋업, iOS/Android 동시 배포. |
| **Backend (BaaS)** | **Firebase** | 1인 개발, 서버리스(Serverless), Auth/DB 통합. |
| **Database** | **Firestore (NoSQL)** | Firebase 생태계, 유연한 스키마, 실시간 동기화. |
| **Authentication** | **Firebase Auth** | Google/Apple 소셜 로그인 간편 구현. |
| **Navigation** | **React Navigation** | React Native 표준 내비게이션. |
| **State Management** | **React Context API** | v0.1 범위에서는 인증 상태 등 간단한 전역 상태만 필요. (추가 라이브러리 X) |
| **UI Components** | `react-native-ratings` (별점) 
 `react-native-slider` (슬라이더) | 핵심 UI를 빠르게 구현하기 위한 최소한의 라이브러리. |

---

### 2. Firestore 스키마 (DB 설계) (v0.1)

**핵심 원칙:** 데이터는 정규화보다 **'읽기 편의성'**을 우선한다. v0.1에서는 클라이언트(앱)가 계산을 조금 더 하더라도 DB 구조를 단순하게 유지한다.

### Collection 1: `users`

- **Document ID:** `uid` (Firebase Auth에서 제공하는 User ID)
- **설명:** 앱에 가입한 사용자 정보.

| **필드명** | **타입** | **설명** | **예시** |
| --- | --- | --- | --- |
| `email` | String | 유저 이메일 (Auth 제공) | `test@gmail.com` |
| `displayName` | String | 유저 닉네임 (Auth 제공) | `커피왕` |
| `createdAt` | Timestamp | 가입일 | `2025-11-17T15:30:00Z` |

### Collection 2: `cafes`

- **Document ID:** (Auto-ID)
- **설명:** v0.1의 초기 카페 30곳 정보. **(Firebase 콘솔에서 대표님이 수동 입력)**

| **필드명** | **타입** | **설명** | **예시** |
| --- | --- | --- | --- |
| `name` | String | 카페 이름 | `블루보틀 성수` |
| `address` | String | 주소 | `서울시 성동구...` |
| `locationTags` | Array | [대분류, 소분류] (필터용) | `["서울", "성수"]` |
| `thumbnailUrl` | String | v0.1용 썸네일 URL (하드코딩) | `https://.../image.png` |

> [v0.1 결정] avgRating (평균 평점), reviewCount (리뷰 수) 필드를 두지 않는다.
> 
> 
> 사유: DB-App 동기화 로직(Cloud Function 등)이 복잡해짐. v0.1에서는 앱이 카페 상세 진입 시 reviews 컬렉션을 쿼리하여 클라이언트에서 실시간으로 계산한다. (속도보다 개발 단순성 우선)
> 

### Collection 3: `reviews`

- **Document ID:** (Auto-ID)
- **설명:** 앱의 핵심 자산. 모든 유저의 리뷰 데이터.

| **필드명** | **타입** | **설명** | **예시** |
| --- | --- | --- | --- |
| `userId` | String | 작성자 ID (Ref: `users/uid`) | `uid-12345` |
| `cafeId` | String | 카페 ID (Ref: `cafes/auto-id`) | `cafe-abcde` |
| `createdAt` | Timestamp | 작성 시간 (정렬용) | `2025-11-18T10:00:00Z` |
| **(초급)** `rating` | Number | 전체 평점 (1-5) | `4` |
| **(초급)** `basicTags` | Array | [맛 태그] (다중 선택) | `["#고소한", "#부드러운"]` |
| **(초급)** `comment` | String (Nullable) | 한 줄 코멘트 | `"라떼가 정말 고소해요"` |
| **(고급)** `acidity` | Number (Nullable) | 산미 (1-5) | `4` |
| **(고급)** `body` | Number (Nullable) | 바디 (1-5) | `2` |
| **(고급)** `advancedTags` | Array (Nullable) | [상세 향 태그] | `["#꽃향기", "#시트러스"]` |
| **(고급)** `roasting` | String (Nullable) | 로스팅 정도 | `"Light"` |

> [v0.1 결정] reviews 컬렉션의 userId와 cafeId 필드는 Firestore 콘솔에서 '색인(Index)'을 생성해야 쿼리(내 리뷰, 카페별 리뷰)가 가능하다.
> 

---

### 3. 글로벌 디자인 시스템 (v0.1)

**핵심 원칙:** '예쁜' 앱이 아니라 '일관된' 앱을 만든다. 모든 컴포넌트는 이 시스템을 따른다.

### 3.1. Colors (색상)

- `/constants/colors.js` 파일로 관리.
- **Brand:** `#6F4E37` (Coffee Brown - 로고, 핵심 아이콘 등)
- **Accent:** `#D4A276` (Light Tan - 버튼, 활성화된 탭)
- **Text (Primary):** `#333333` (진한 회색 - 본문)
- **Text (Secondary):** `#888888` (연한 회색 - 부가 정보, placeholder)
- **Background:** `#FFFFFF` (기본 배경)
- **Error:** `#D9534F` (에러 메시지)

### 3.2. Typography (서체)

- **Font Family:** **Pretendard** (앱 전체 기본 폰트)
- `H1 (타이틀)`: 24px, Bold
- `H2 (서브 타이틀)`: 18px, SemiBold
- `Body (본문)`: 16px, Regular
- `Caption (부가 설명)`: 14px, Regular
- `Tag (태그)`: 13px, Medium

### 3.3. Core Components

- `/components` 폴더에 재사용 가능한 컴포넌트 생성.
- **`components/CustomButton.js`**
    - `primary` (Accent 색상 배경), `secondary` (테두리만) 2가지 타입.
- **`components/Tag.js`**
    - `#`가 붙은 태그 UI. (선택 시 색상 변경)
- **`components/LoadingSpinner.js`**
    - 화면 중앙에 표시되는 `ActivityIndicator`.
- **`components/StarRating.js`**
    - `react-native-ratings`를 래핑(wrapping)한 커스텀 컴포넌트.

---