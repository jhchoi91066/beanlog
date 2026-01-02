// User Service - Firestore 유저 데이터 관리
// 문서 참조: The Foundation - Firestore 스키마

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs, query, where, limit } from 'firebase/firestore';
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
      birthDate: userData.birthDate || null, // YYYY-MM
      region: userData.region || null,
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
 * 닉네임 중복 확인
 * @param {string} displayName - 확인할 닉네임
 * @returns {Promise<boolean>} 사용 가능 여부 (true: 사용 가능, false: 중복)
 */
export const isDisplayNameAvailable = async (displayName) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('displayName', '==', displayName), limit(1));
    const snapshot = await getDocs(q);

    return snapshot.empty; // 비어있으면 사용 가능
  } catch (error) {
    console.error('Error checking nickname availability:', error);
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
/**
 * 사용자 취향 정보 업데이트
 * @param {string} uid - Firebase Auth UID
 * @param {Object} preferences - 취향 정보 (acidity, body, roast 등)
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (uid, preferences) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Generate a human-readable description of the user's taste preferences
 * @param {Object} preferences - User preferences { acidity, body, roast }
 * @returns {string} Description string
 */
export const getTasteDescription = (preferences) => {
  if (!preferences) return '아직 취향을 탐험 중이에요.';

  const { acidity, body, roast } = preferences;
  const descriptions = [];

  if (roast === 'dark') descriptions.push('진하고 묵직한 다크 로스트');
  else if (roast === 'light') descriptions.push('화사한 산미의 라이트 로스트');
  else if (roast === 'medium') descriptions.push('밸런스 좋은 미디엄 로스트');

  if (acidity === 'high') descriptions.push('상큼한 산미');
  else if (acidity === 'low') descriptions.push('고소한 맛');

  if (body === 'heavy') descriptions.push('묵직한 바디감');
  else if (body === 'light') descriptions.push('깔끔한 목넘김');

  if (descriptions.length === 0) return '다양한 커피를 즐기는 탐험가';

  return `${descriptions.join(', ')}을(를) 선호하는 커피 애호가입니다.`;
};
