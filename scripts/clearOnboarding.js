// Clear AsyncStorage onboarding flag
// Run this script to reset onboarding so it shows on next app start

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearOnboarding() {
  try {
    await AsyncStorage.removeItem('hasSeenOnboarding');
    console.log('✅ Onboarding flag cleared successfully');
    console.log('Now restart the app to see onboarding screen');
  } catch (error) {
    console.error('❌ Error clearing onboarding flag:', error);
  }
}

clearOnboarding();
