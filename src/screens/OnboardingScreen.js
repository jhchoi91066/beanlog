// BeanLog - OnboardingScreen (Taste-First Approach)
// Replaces generic slides with a Taste Preference Survey
// Follows "Personal Coffee Sommelier" pivot plan

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../components';
import { Colors, Typography } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { updateUserPreferences } from '../services/userService';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    acidity: null, // 'high', 'medium', 'low'
    body: null,    // 'heavy', 'medium', 'light'
    roast: null,   // 'dark', 'medium', 'light'
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Survey Steps Configuration
  const steps = [
    {
      id: 'intro',
      title: '당신의 커피 취향을\n찾아드릴게요',
      description: '몇 가지 질문으로\n나만의 커피 소믈리에를 시작해보세요.',
      icon: 'cafe',
      type: 'intro'
    },
    {
      id: 'acidity',
      title: '산미(신맛)를\n좋아하시나요?',
      description: '과일처럼 상큼한 맛을 선호하시는지 알려주세요.',
      icon: 'leaf',
      type: 'question',
      options: [
        { label: '좋아해요 (상큼함)', value: 'high', icon: 'happy' },
        { label: '보통이에요', value: 'medium', icon: 'remove' },
        { label: '싫어해요 (고소함)', value: 'low', icon: 'sad' }
      ]
    },
    {
      id: 'body',
      title: '어떤 바디감을\n선호하시나요?',
      description: '입안에 머금었을 때의 무게감을 선택해주세요.',
      icon: 'water',
      type: 'question',
      options: [
        { label: '묵직하고 진한', value: 'heavy', icon: 'barbell' },
        { label: '적당한 밸런스', value: 'medium', icon: 'git-compare-outline' },
        { label: '가볍고 깔끔한', value: 'light', icon: 'cloud-outline' }
      ]
    },
    {
      id: 'roast',
      title: '선호하는 로스팅\n정도는?',
      description: '원두를 볶는 정도에 따라 맛이 달라집니다.',
      icon: 'flame',
      type: 'question',
      options: [
        { label: '다크 (진하고 씀)', value: 'dark', icon: 'moon' },
        { label: '미디엄 (균형잡힘)', value: 'medium', icon: 'contrast' },
        { label: '라이트 (화사함)', value: 'light', icon: 'sunny' }
      ]
    },
    {
      id: 'completion',
      title: '준비 완료!',
      description: '당신의 취향에 딱 맞는 커피를\n추천해드릴게요.',
      icon: 'checkmark-circle',
      type: 'completion'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      finishOnboarding();
    }
  };

  const handleOptionSelect = (stepId, value) => {
    setPreferences(prev => ({ ...prev, [stepId]: value }));
    // Auto advance after selection with a slight delay for visual feedback
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const animateTransition = (callback) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 0, // Reset position instantly while invisible
        useNativeDriver: true,
      })
    ]).start(() => {
      callback();
      slideAnim.setValue(width); // Start from right
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const finishOnboarding = async () => {
    try {
      // Save onboarding status locally
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');

      // Save preferences to Firestore if user is logged in (unlikely in this flow, but good practice)
      // Note: Usually user logs in AFTER onboarding. We might need to pass these prefs to LoginScreen
      // or save them to AsyncStorage and upload after login.
      // For now, we'll save to AsyncStorage to be retrieved after login.
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));

      navigation.replace('Login');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      navigation.replace('Login');
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    return (
      <Animated.View
        style={[
          styles.stepContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContainer}>
          <Ionicons name={step.icon} size={60} color={Colors.brand} style={styles.icon} />
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.contentContainer}>
          {step.type === 'intro' && (
            <CustomButton
              title="시작하기"
              onPress={handleNext}
              variant="primary"
              style={styles.mainButton}
            />
          )}

          {step.type === 'question' && (
            <View style={styles.optionsContainer}>
              {step.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    preferences[step.id] === option.value && styles.selectedOption
                  ]}
                  onPress={() => handleOptionSelect(step.id, option.value)}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={preferences[step.id] === option.value ? Colors.white : Colors.textSecondary}
                    style={styles.optionIcon}
                  />
                  <Text style={[
                    styles.optionText,
                    preferences[step.id] === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step.type === 'completion' && (
            <CustomButton
              title="BeanLog 시작하기"
              onPress={finishOnboarding}
              variant="primary"
              style={styles.mainButton}
            />
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / steps.length) * 100}%` }
          ]}
        />
      </View>

      {renderStep()}

      {/* Skip button (only for intro) */}
      {currentStep === 0 && (
        <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 40,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand,
    borderRadius: 2,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contentContainer: {
    width: '100%',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedOptionText: {
    color: Colors.white,
  },
  mainButton: {
    width: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
});

export default OnboardingScreen;
