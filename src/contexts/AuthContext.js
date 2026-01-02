// Authentication Context
// 문서 참조: The Foundation - 기술/디자인 결정서

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUser, getUserById } from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 유저 정보 가져오기
        try {
          let userData = await getUserById(firebaseUser.uid);

          // Firestore에 유저 정보가 없으면 생성
          if (!userData) {
            userData = await createUser(firebaseUser.uid, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '익명'
            });
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName,
            providerData: firebaseUser.providerData, // Include providerData
            ...userData
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Google 로그인
   * @param {Object} credential - Google credential
   */
  const signInWithGoogle = async (credential) => {
    try {
      const googleCredential = GoogleAuthProvider.credential(credential);
      await signInWithCredential(auth, googleCredential);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  /**
   * Apple 로그인
   * @param {Object} credential - Apple credential
   */
  const signInWithApple = async (credential) => {
    try {
      // TODO: Apple 로그인 구현 (Expo Apple Authentication 사용)
      console.log('Apple sign in - To be implemented');
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  };

  /**
   * 이메일/비밀번호 로그인
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   */
  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  /**
   * 이메일/비밀번호 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {string} displayName - 닉네임
   */
  const signUpWithEmail = async (email, password, displayName, birthDate, region) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Firestore에 유저 정보 생성
      await createUser(userCredential.user.uid, {
        email,
        displayName: displayName || '익명',
        birthDate: birthDate || null,
        region: region || null
      });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  /**
   * 로그아웃
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
