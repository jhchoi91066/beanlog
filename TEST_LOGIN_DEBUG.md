# 로그인 문제 디버깅 가이드

## 확인해야 할 사항들:

### 1. Firebase Console 확인
1. https://console.firebase.google.com/ 접속
2. `beanlog-app-459cc` 프로젝트 선택
3. **Authentication** > **Sign-in method** 클릭
4. **이메일/비밀번호** 제공업체가 **"사용 설정됨"** 상태인지 확인
   - 만약 "사용 중지됨"이면 클릭해서 활성화

### 2. 터미널 로그 확인
Metro bundler 터미널에서 다음과 같은 에러가 있는지 확인:
- `Firebase: Error (auth/...)`
- `Network request failed`
- JavaScript 에러

### 3. Expo Go 앱에서 로그 확인
Expo Go 앱을 흔들어서 Developer Menu 열기:
- "Show Performance Monitor" 또는
- "Debug Remote JS" 활성화 후 Chrome DevTools에서 Console 확인

### 4. 테스트 계정 생성
Firebase Console에서 수동으로 테스트 계정 생성:
1. Authentication > Users > Add user
2. 이메일: test@test.com
3. 비밀번호: test123456
4. 앱에서 이 계정으로 로그인 시도

### 5. 간단한 버튼 테스트
LoginScreen.js에서 버튼이 실제로 클릭되는지 테스트:
- 로그인 버튼을 눌렀을 때 터미널에 "🔵 Login button pressed" 같은 로그가 나오는지 확인
- 만약 로그가 안 나오면 TouchableOpacity가 작동하지 않는 것

### 6. 네트워크 연결 확인
- WiFi/모바일 데이터 연결 상태 확인
- 방화벽이나 VPN이 Firebase API를 차단하고 있지 않은지 확인

## 다음 단계:
위 내용을 확인한 후 어떤 에러가 발생하는지 알려주세요!
