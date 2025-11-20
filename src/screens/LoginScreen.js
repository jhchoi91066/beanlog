// Login Screen - 로그인 화면
// 문서 참조: The Blueprint - G-0.3 인증

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { CustomButton, LoadingSpinner } from '../components';
import { Colors, Typography } from '../constants';
import { useAuth } from '../contexts';

const LoginScreen = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      let errorMessage = '로그인 실패';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      }
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('오류', '모든 정보를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
      Alert.alert('회원가입 성공', '환영합니다!');
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      let errorMessage = '회원가입 실패';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      }
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingSpinner visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>☕</Text>
            <Text style={styles.appName}>BeanLog</Text>
            <Text style={styles.tagline}>커피 맛, 기록하고 발견하다</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                placeholderTextColor={Colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 (최소 6자)"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <CustomButton
              title={isSignUp ? '회원가입' : '로그인'}
              onPress={isSignUp ? handleEmailSignUp : handleEmailSignIn}
              style={styles.button}
            />

            <CustomButton
              title={isSignUp ? '로그인으로 전환' : '회원가입으로 전환'}
              onPress={() => setIsSignUp(!isSignUp)}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>

        <Text style={styles.footer}>
          {isSignUp ? '회원가입하면' : '로그인하면'} 서비스 이용약관에 동의하게 됩니다
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    ...Typography.h1,
    color: Colors.brand,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  button: {
    marginBottom: 12,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 24,
  },
});

export default LoginScreen;
