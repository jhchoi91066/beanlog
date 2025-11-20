// BeanLog - OnboardingScreen (G-0.4 Initial Onboarding)
// 3-page swiper introducing app value proposition and features
// Follows The Blueprint - G-0.4 and The Foundation design system

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomButton } from '../components';
import { Colors, Typography } from '../constants';

/**
 * OnboardingScreen - Initial onboarding experience shown only once
 *
 * Features:
 * - 3-page swiper with app introduction
 * - Skip button on all pages
 * - "시작하기" button on final page
 * - Sets 'hasSeenOnboarding' flag in AsyncStorage
 * - Navigates to Login screen upon completion
 */
const OnboardingScreen = ({ navigation }) => {
  // Handle skip button - mark onboarding as complete and navigate to Login
  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Still navigate even if storage fails
      navigation.replace('Login');
    }
  };

  // Handle "시작하기" button on final page
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Still navigate even if storage fails
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip button - top right on all pages */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipButtonText}>건너뛰기</Text>
      </TouchableOpacity>

      <Swiper
        loop={false}
        showsButtons={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.pagination}
      >
        {/* Page 1: 앱 가치 제안 */}
        <View style={styles.slide}>
          <View style={styles.contentContainer}>
            <Text style={styles.icon}>☕</Text>
            <Text style={styles.title}>커피 맛, 기록하고 발견하다</Text>
            <Text style={styles.description}>
              BeanLog와 함께 당신만의 커피 취향을 찾아보세요
            </Text>
          </View>
        </View>

        {/* Page 2: 리뷰 모드 설명 */}
        <View style={styles.slide}>
          <View style={styles.contentContainer}>
            <Text style={styles.icon}>⭐</Text>
            <Text style={styles.title}>초급·고급 모드</Text>
            <Text style={styles.description}>
              간단한 평점부터 전문가 수준의 상세 리뷰까지, 당신의 수준에 맞게
            </Text>
          </View>
        </View>

        {/* Page 3: 시작하기 */}
        <View style={styles.slide}>
          <View style={styles.contentContainer}>
            <Text style={styles.icon}>📝</Text>
            <Text style={styles.title}>나만의 커피 기록 시작</Text>
            <Text style={styles.description}>
              지금 바로 첫 리뷰를 작성하고 취향을 발견하세요
            </Text>

            {/* 시작하기 button - only on final page */}
            <View style={styles.buttonContainer}>
              <CustomButton
                title="시작하기"
                onPress={handleGetStarted}
                variant="primary"
              />
            </View>
          </View>
        </View>
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Skip button - top right corner
  skipButton: {
    position: 'absolute',
    top: 60, // Safe area offset for status bar
    right: 20,
    zIndex: 10, // Ensure it's above the swiper
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Swiper pagination styles
  pagination: {
    bottom: 120, // Position above the button on final page
  },
  dot: {
    backgroundColor: Colors.border,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.brand,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // Slide layout
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  // Icon styling - large emoji
  icon: {
    fontSize: 80,
    marginBottom: 40,
  },
  // Title styling - Design System h1
  title: {
    ...Typography.h1,
    color: Colors.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Description styling - Design System body
  description: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 60,
  },
  // Button container on final page
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
});

export default OnboardingScreen;
