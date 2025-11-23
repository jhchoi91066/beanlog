// Feed Service - Community reviews feed management
// Fetches reviews from all users for the community feed

import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get recent reviews from all users for community feed
 * @param {number} limitCount - Number of reviews to fetch (default 20)
 * @returns {Promise<Array>} Array of review objects with user info
 *
 * Review object structure:
 * {
 *   id: string,
 *   userId: string,
 *   cafeId: string,
 *   cafeName: string,
 *   cafeAddress: string,
 *   rating: number (1-5),
 *   basicTags: Array<string>,
 *   comment: string,
 *   coffeeName: string,
 *   photoUrls: Array<string>,
 *   flavorProfile: { acidity, sweetness, body, bitterness, aroma },
 *   userDisplayName: string,
 *   userPhotoURL: string,
 *   createdAt: Timestamp
 * }
 */
export const getRecentReviews = async (limitCount = 20) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    throw error;
  }
};

/**
 * Get reviews filtered by basic tag
 * @param {string} tag - Tag to filter by (e.g., '산미', '고소한', '달콤한')
 * @param {number} limitCount - Number of reviews to fetch
 * @returns {Promise<Array>} Filtered array of reviews
 */
export const getReviewsByTag = async (tag, limitCount = 20) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    // Query reviews where basicTags array contains the specified tag
    const q = query(
      reviewsRef,
      where('basicTags', 'array-contains', tag),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reviews by tag:', error);
    // If the error is due to missing index, return empty array
    // Firebase will show console warning about creating the index
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index needed for tag filtering. Please create the index.');
      return [];
    }
    throw error;
  }
};

/**
 * Get reviews filtered by advanced tag (flavor notes)
 * @param {string} tag - Advanced tag to filter by (e.g., '초콜릿', '베리류', '시트러스')
 * @param {number} limitCount - Number of reviews to fetch
 * @returns {Promise<Array>} Filtered array of reviews
 */
export const getReviewsByAdvancedTag = async (tag, limitCount = 20) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('advancedTags', 'array-contains', tag),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching reviews by advanced tag:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index needed for advanced tag filtering.');
      return [];
    }
    throw error;
  }
};
