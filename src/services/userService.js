// User Service - Firestore 유저 데이터 관리
// 문서 참조: The Foundation - Firestore 스키마

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * 새 유저 생성
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData - 유저 데이터
 * @param {string} userData.email - 이메일
 * @param {string} userData.displayName - 닉네임
 * @returns {Promise<Object>} 생성된 유저 정보
 */
export const createUser = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = {
      email: userData.email,
      displayName: userData.displayName,
      createdAt: serverTimestamp()
    };

    await setDoc(userRef, userDoc);

    return {
      id: uid,
      ...userDoc
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * 유저 ID로 유저 정보 가져오기
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object|null>} 유저 정보
 */
export const getUserById = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * 유저 정보 업데이트
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData - 업데이트할 데이터
 * @returns {Promise<void>}
 */
export const updateUser = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
/**
 * 유저 삭제 (회원 탈퇴)
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export const deleteUser = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
