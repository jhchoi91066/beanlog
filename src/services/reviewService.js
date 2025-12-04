// Review Service - Firestore 리뷰 데이터 관리
// 문서 참조: The Foundation - Firestore 스키마

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * 특정 카페의 리뷰 목록 가져오기 (최신순)
 * @param {string} cafeId - 카페 ID
 * @returns {Promise<Array>} 리뷰 목록
 */
export const getReviewsByCafe = async (cafeId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('cafeId', '==', cafeId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reviews by cafe:', error);
    throw error;
  }
};

/**
 * 특정 유저의 리뷰 목록 가져오기
 * @param {string} userId - 유저 ID
 * @returns {Promise<Array>} 리뷰 목록
 */
export const getReviewsByUser = async (userId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reviews by user:', error);
    throw error;
  }
};

/**
 * 새 리뷰 작성
 * @param {Object} reviewData - 리뷰 데이터
 * @param {string} reviewData.userId - 작성자 ID
 * @param {string} reviewData.cafeId - 카페 ID
 * @param {string} [reviewData.cafeName] - 카페 이름 (선택)
 * @param {string} [reviewData.cafeAddress] - 카페 주소 (선택)
 * @param {number} reviewData.rating - 전체 평점 (1-5)
 * @param {Array} reviewData.basicTags - 맛 태그 배열
 * @param {string} [reviewData.comment] - 한 줄 코멘트 (선택)
 * @param {string} [reviewData.coffeeName] - 커피/메뉴 이름 (선택)
 * @param {number} [reviewData.acidity] - 산미 (1-5, 선택)
 * @param {number} [reviewData.body] - 바디 (1-5, 선택)
 * @param {Object} [reviewData.flavorProfile] - 맛 프로필 객체 (선택)
 * @param {Array} [reviewData.advancedTags] - 상세 향 태그 (선택)
 * @param {string} [reviewData.roasting] - 로스팅 정도 (선택)
 * @param {Array} [reviewData.photoUrls] - 사진 URL 배열 (선택)
 * @returns {Promise<Object>} 생성된 리뷰 정보
 *
 * Note: This function automatically adds userDisplayName and userPhotoURL
 * from the currently authenticated user for community feed display
 */
import { checkAchievements } from './achievementService';

// ... (existing imports)

/**
 * 새 리뷰 작성
 * ...
 */
export const createReview = async (reviewData) => {
  try {
    const reviewsRef = collection(db, 'reviews');

    // Add user display info from current auth user for feed display
    const currentUser = auth.currentUser;
    const reviewWithUserInfo = {
      ...reviewData,
      userDisplayName: currentUser?.displayName || '익명',
      userPhotoURL: currentUser?.photoURL || null,
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(reviewsRef, reviewWithUserInfo);

    // Check for achievements
    if (currentUser) {
      try {
        // Fetch updated user reviews to calculate stats
        const userReviews = await getReviewsByUser(currentUser.uid);

        // Calculate stats
        const uniqueCafes = new Set(userReviews.map(r => r.cafeId)).size;
        const photoReviews = userReviews.filter(r => r.photoUrls && r.photoUrls.length > 0).length;

        const stats = {
          totalReviews: userReviews.length,
          uniqueCafes,
          photoReviews
        };

        await checkAchievements(currentUser.uid, stats);
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError);
        // Don't fail the review creation if achievement check fails
      }
    }

    return {
      id: docRef.id,
      ...reviewWithUserInfo
    };
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * 리뷰 수정 (v0.2: F-EDIT)
 * @param {string} reviewId - 리뷰 ID
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...updateData,
      updatedAt: serverTimestamp() // v0.2: Track modification time
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * 리뷰 삭제 (v0.2 기능 - 현재는 stub)
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * 카페의 평균 평점 계산 (클라이언트 측 계산)
 * @param {string} cafeId - 카페 ID
 * @returns {Promise<number>} 평균 평점 (소수점 1자리)
 */
export const calculateAverageRating = async (cafeId) => {
  try {
    const reviews = await getReviewsByCafe(cafeId);

    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;

    return Math.round(average * 10) / 10; // 소수점 1자리
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
};
