// User Service - Firestore 유저 데이터 관리
// 문서 참조: The Foundation - Firestore 스키마

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
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

/**
 * 사용자 차단
 * @param {string} uid - Firebase Auth UID (차단하는 사람)
 * @param {string} targetUid - 차단할 대상 UID
 * @returns {Promise<void>}
 */
export const blockUser = async (uid, targetUid) => {
  try {
    const blockRef = doc(db, 'users', uid, 'blockedUsers', targetUid);
    await setDoc(blockRef, {
      blockedAt: serverTimestamp(),
    });
    console.log(`User ${targetUid} blocked by ${uid}`);
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

/**
 * 차단된 사용자 목록 가져오기
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Array>} 차단된 사용자 ID 목록
 */
export const getBlockedUsers = async (uid) => {
  try {
    const blockedUsersRef = collection(db, 'users', uid, 'blockedUsers');
    const snapshot = await getDocs(blockedUsersRef);

    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }
};

/**
 * 사용자 차단 해제
 * @param {string} uid - Firebase Auth UID
 * @param {string} targetUid - 차단 해제할 대상 UID
 * @returns {Promise<void>}
 */
export const unblockUser = async (uid, targetUid) => {
  try {
    const blockRef = doc(db, 'users', uid, 'blockedUsers', targetUid);
    await deleteDoc(blockRef);
    console.log(`User ${targetUid} unblocked by ${uid}`);
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};
