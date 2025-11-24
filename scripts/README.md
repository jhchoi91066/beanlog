# 탐색 탭 예시 데이터 추가하기

탐색 탭의 현재 디자인을 유지하기 위해 Firebase에 예시 데이터를 추가하는 스크립트입니다.

## 사전 준비

### 1. Firebase 서비스 계정 키 다운로드

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. 프로젝트 설정(⚙️) → 서비스 계정
4. "새 비공개 키 생성" 버튼 클릭
5. 다운로드한 JSON 파일의 이름을 `serviceAccountKey.json`으로 변경
6. 프로젝트 루트 디렉토리에 복사 (`/Users/jinhochoi/Desktop/dev/beanlog/serviceAccountKey.json`)

⚠️ **주의**: `serviceAccountKey.json` 파일은 절대 Git에 커밋하지 마세요! (.gitignore에 이미 추가되어 있습니다)

## 실행 방법

```bash
# 프로젝트 루트 디렉토리에서 실행
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

## 데이터 삭제 방법

나중에 실제 데이터가 쌓이면 Firebase Console에서 직접 삭제하거나, 다음 스크립트를 실행하세요:

```bash
node scripts/deleteExploreData.js
```
