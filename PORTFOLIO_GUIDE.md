# BeanLog (빈로그) - 프로젝트 분석 및 포트폴리오 가이드

BeanLog는 사용자의 커피 취향을 기록하고 분석하는 **'퍼스널 커피 소믈리에'** 컨셉의 모바일 애플리케이션입니다. 단순한 방문 기록을 넘어, 사용자의 미각을 데이터화하고 시각화하는 데 중점을 둔 프로젝트입니다.

---

## 🚀 프로젝트 개요 (Overview)

- **컨셉**: 당신의 커피 취향을 기록하고 공유하는 개인 커피 소믈리에
- **핵심 가치**: "Taste-First" (맛 중심의 기록), "Discovery" (취향 기반 카페 탐색)
- **주요 타겟**: 자신의 커피 취향을 정교하게 기록하고 싶은 커피 애호가

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Language**: JavaScript (ES6+)
- **State Management**: Context API (Auth, Theme), AsyncStorage
- **Navigation**: React Navigation (Bottom Tabs, Native Stack)
- **UI/UX**: Vanilla CSS-in-JS, Expo Haptics (진동 피드백), React Native SVG (차트 시각화)

### Backend & Infrastructure
- **BaaS**: Firebase (Authentication, Firestore, Storage)
- **External APIs**: Naver Maps SDK, Naver Search API (카페 검색)

---

## ✨ 핵심 기능 및 기술적 도전 (Key Features & Technical Challenges)

### 1. 인터랙티브 레이더 차트 (Interactive Flavor Radar)
커피의 5대 맛 지표(산미, 단맛, 바디, 쓴맛, 향)를 시각화하고, 사용자가 차트를 직접 드래그하여 조절할 수 있는 커스텀 컴포넌트를 구현했습니다.
- **기술적 구현**: `React Native SVG`와 `PanResponder`를 사용하여 물리적인 드래그 좌표를 5분할된 맛 데이터로 변환하는 알고리즘 설계.
- **UX 디테일**: 데이터가 변경될 때마다 `Expo Haptics`를 통한 미세한 진동 피드백을 제공하여 "조작감" 극대화.

### 2. 스마트 향미 태그 추천 (Smart Tag Suggestions)
사용자가 입력한 레이더 차트의 값에 따라 어울리는 향미 태그를 실시간으로 추천하는 기능을 구현했습니다.
- **로직**: 산미가 4.0 이상일 경우 '시트러스', '상큼한' 태그를 우선 추천하는 방식의 데이터 매핑 로직 적용.
- **성과**: 사용자의 고민 시간을 줄여주고, 보다 정확한 테이스팅 노트를 작성하도록 가이드 제공.

### 3. 지도 기반 카페 디스커버리 (Map-Based Discovery)
네이버 지도를 통합하여 현재 위치 기반으로 주변 카페를 탐색하고, 작성된 리뷰의 향미 데이터를 지도상에 마커로 표시합니다.
- **기술적 구현**: `Haversine` 공식을 활용한 실시간 거리 계산 및 정렬. Naver Map WebView를 통한 고성능 지도 렌더링.

### 4. 커피 여권 (Coffee Passport) & 게이미피케이션
사용자의 활동 데이터(기록 횟수, 방문 카페 수 등)를 '커피 여권' 형태로 시각화하여 소장 가치를 높였습니다.
- **기능**: 업적 시스템(`AchievementService`)을 통해 '첫 잔', '탐험가', '마스터' 등 배지 부여.
- **공유**: `view-shot` 라이브러리를 통해 여권 이미지를 캡처하고 SNS로 공유할 수 있는 기능 제공.

---

## 📈 포트폴리오 강조 포인트 (Portfolio Highlights)

1. **사용자 경험(UX) 중심 설계**: 단순히 폼을 채우는 방식이 아닌, 그래프를 직접 만지고 태그를 추천받는 인터랙티브한 경험을 통해 앱의 정체성 구축.
2. **데이터 시각화**: 복잡한 미각 데이터를 레이더 차트와 통계 화면(My Page)을 통해 한눈에 파악할 수 있도록 구현.
3. **완성도 높은 모바일 환경**: 다크 모드 지원, 소셜 로그인(Google/Apple), 스켈레톤 로더(Skeleton UI)를 통한 부드러운 로딩 경험 등 상용 수준의 UI/UX 디테일.
4. **아키텍처**: 서비스 레이어(`services/`) 분리를 통해 비즈니스 로직과 UI 컴포넌트 간의 결합도를 낮추고 유지보수 용이성 확보.

---

## 📝 마무리 멘트 (Portfolio Summary)

"BeanLog는 파편화된 커피 경험을 기록으로 자산화하는 과정을 고민한 프로젝트입니다. 특히 **데이터 시각화와 인터랙티브 인터페이스**를 통해 사용자에게 즐거운 기록 경험을 제공하는 데 집중했으며, Firebase와 외부 API를 결합하여 실서비스가 가능한 수준의 완성도를 목표로 개발했습니다."
