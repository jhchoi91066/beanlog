// Cafe Service - Firestore 카페 데이터 관리
// 문서 참조: The Foundation - Firestore 스키마

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { getReviewsByCafe } from './reviewService';

/**
 * 모든 카페 목록 가져오기
 * @returns {Promise<Array>} 카페 목록
 */
export const getAllCafes = async () => {
  try {
    const cafesRef = collection(db, 'cafes');
    const snapshot = await getDocs(cafesRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching cafes:', error);
    throw error;
  }
};

/**
 * 카페 ID로 특정 카페 정보 가져오기
 * @param {string} cafeId - 카페 ID
 * @returns {Promise<Object>} 카페 정보
 */
export const getCafeById = async (cafeId) => {
  try {
    const cafeRef = doc(db, 'cafes', cafeId);
    const snapshot = await getDoc(cafeRef);

    if (!snapshot.exists()) {
      throw new Error('Cafe not found');
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    console.error('Error fetching cafe:', error);
    throw error;
  }
};

/**
 * 지역별 카페 필터링
 * @param {string} locationTag - 지역 태그 (예: "성수", "연남")
 * @returns {Promise<Array>} 필터링된 카페 목록
 */
export const getCafesByLocation = async (locationTag) => {
  try {
    const cafesRef = collection(db, 'cafes');
    const q = query(cafesRef, where('locationTags', 'array-contains', locationTag));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching cafes by location:', error);
    throw error;
  }
};

/**
 * Calculate average rating for a cafe from its reviews
 * @param {string} cafeId - Cafe ID
 * @returns {Promise<number>} Average rating (0-5, rounded to 1 decimal place)
 *
 * Returns 0 if cafe has no reviews
 * Used for displaying star ratings in cafe lists
 */
export const calculateCafeRating = async (cafeId) => {
  try {
    const reviews = await getReviewsByCafe(cafeId);
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    const average = sum / reviews.length;

    // Return rating rounded to 1 decimal place
    return Math.round(average * 10) / 10;
  } catch (error) {
    console.error('Error calculating cafe rating:', error);
    return 0;
  }
};

/**
 * Get cafe with calculated average rating
 * @param {string} cafeId - Cafe ID
 * @returns {Promise<Object>} Cafe object with averageRating property
 */
export const getCafeWithRating = async (cafeId) => {
  try {
    const cafe = await getCafeById(cafeId);
    const averageRating = await calculateCafeRating(cafeId);

    return {
      ...cafe,
      averageRating
    };
  } catch (error) {
    console.error('Error fetching cafe with rating:', error);
    throw error;
  }
};
