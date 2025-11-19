// AsyncStorage 온보딩 플래그 초기화 스크립트
// 이 스크립트는 웹 버전에서만 작동합니다

console.log(`
⚠️  이 스크립트는 Expo Web에서만 작동합니다.

모바일에서 온보딩을 다시 보려면:
1. 앱 삭제 후 재설치
2. 또는 아래 코드를 앱 내에서 실행:

import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('hasSeenOnboarding');

앱을 재시작하면 온보딩이 다시 표시됩니다.
`);
