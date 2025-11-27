# BeanLog 데이터 관리 스크립트

Firebase 데이터를 관리하는 스크립트 모음입니다.

## 사전 준비

### 1. Firebase 서비스 계정 키 다운로드

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. 프로젝트 설정(⚙️) → 서비스 계정
4. "새 비공개 키 생성" 버튼 클릭
5. 다운로드한 JSON 파일의 이름을 `serviceAccountKey.json`으로 변경
6. 프로젝트 루트 디렉토리에 복사 (`/Users/jinhochoi/Desktop/dev/beanlog/serviceAccountKey.json`)

⚠️ **주의**: `serviceAccountKey.json` 파일은 절대 Git에 커밋하지 마세요! (.gitignore에 이미 추가되어 있습니다)

### 2. 네이버 API 키 설정 (카페 정보 자동 수집용)

1. [네이버 개발자 센터](https://developers.naver.com/apps/)에서 애플리케이션 등록
2. "검색" API 사용 설정
3. 발급받은 Client ID와 Client Secret을 `.env` 파일에 추가:

```bash
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

---

## 📍 카페 데이터 자동 수집 (enrichCafeData.js)

Firestore에 등록된 카페 정보를 네이버 Local Search API를 통해 자동으로 보강합니다.

### 실행 방법

```bash
node scripts/enrichCafeData.js
```

### 기능

- 각 카페의 이름과 주소로 네이버 지역 검색 API 호출
- 다음 정보를 자동으로 Firestore에 추가:
  - `thumbnailUrl`: 카페 썸네일 이미지 (현재는 Unsplash 플레이스홀더)
  - `phone`: 전화번호
  - `category`: 카페 카테고리
  - `naverLink`: 네이버 지도 링크
  - `coordinates`: 정확한 위도/경도 좌표

### 주의사항

- 네이버 API 호출 한도: 일 25,000건
- 카페당 1회만 호출 (Firestore에 저장된 데이터 재사용)
- API 호출 간 150ms 딜레이 적용 (rate limit 준수)

---

## 📝 리뷰 데이터 보강 (enrichReviewData.js)

Firestore의 기존 리뷰에 카페 이름과 커피 이름 정보를 자동으로 추가합니다.

### 실행 방법

```bash
node scripts/enrichReviewData.js
```

### 기능

- 각 리뷰의 `cafeId`를 사용하여 카페 정보 조회
- 다음 정보를 자동으로 Firestore 리뷰에 추가:
  - `cafeName`: 카페 이름 (cafes 컬렉션에서 가져옴)
  - `cafeAddress`: 카페 주소 (cafes 컬렉션에서 가져옴)
  - `coffeeName`: 커피 이름 (코멘트에서 추출 또는 기본값 사용)

### 주의사항

- 이미 `cafeName`과 `coffeeName`이 있는 리뷰는 건너뜁니다
- `cafeId`가 없는 리뷰는 처리할 수 없습니다
- 커피 이름은 코멘트에서 키워드를 찾아 자동 추출하거나 기본값을 사용합니다

---

## 🎨 탐색 탭 예시 데이터 추가 (seedExploreData.js)

탐색 탭의 현재 디자인을 유지하기 위해 Firebase에 예시 데이터를 추가합니다.

### 실행 방법

```bash
node scripts/seedExploreData.js
```

## 추가되는 데이터

### 1. 지금 뜨는 카페 (trendingCafes 컬렉션)
- 테라로사 (강릉)
- 모모스커피 (부산)
- 프릳츠 (서울)

### 2. 에디터 픽 컬렉션 (collections 컬렉션)
- 성수동 커피 투어
- 비 오는 날, 따뜻한 라떼
- 스페셜티 입문하기

### 3. 카테고리 (categories 컬렉션)
- 스페셜티, 디카페인, 핸드드립, 에스프레소바
- 디저트맛집, 대형카페, 로스팅, 원두구매

---

## 🔄 탐색 탭 카페 동기화 (syncExploreCafes.js)

trendingCafes 컬렉션의 카페들을 메인 cafes 컬렉션에 동기화하고 네이버 API로 정보를 보강합니다.

### 실행 방법

```bash
node scripts/syncExploreCafes.js
```

### 기능

- trendingCafes 컬렉션의 각 카페를 메인 cafes 컬렉션에 생성
- 다음 정보를 자동으로 추가:
  - `name`: 카페 이름 (trendingCafes에서 가져옴)
  - `address`: 주소 (trendingCafes에서 가져옴)
  - `coordinates`: 위도/경도 좌표 (trendingCafes 또는 네이버 API)
  - `thumbnailUrl`: 카페 이미지
  - `locationTags`: 지역 태그 (자동 생성)
  - `phone`: 전화번호 (네이버 API)
  - `category`: 카페 카테고리 (네이버 API)
  - `naverLink`: 네이버 지도 링크 (네이버 API)
- trendingCafes 문서에 `cafeId` 참조 추가
- 이미 동기화된 카페는 자동으로 건너뜀

### 주의사항

- 네이버 API 키가 설정되어 있어야 추가 정보를 가져올 수 있습니다
- 이미 cafeId가 있는 trending 카페는 다시 생성하지 않습니다

---

## 데이터 삭제 방법

나중에 실제 데이터가 쌓이면 Firebase Console에서 직접 삭제하거나, 다음 스크립트를 실행하세요:

```bash
node scripts/deleteExploreData.js
```
