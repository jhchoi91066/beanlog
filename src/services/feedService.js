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

/**
 * Get personalized feed based on user preferences and optional flavor filter
 * @param {Object} preferences - User preferences { acidity, body, roast }
 * @param {number} limitCount - Number of reviews to return
 * @param {Object} flavorFilter - Optional filter { acidity, sweetness, body, bitterness, aroma }
 * @returns {Promise<Array>} Filtered and sorted array of reviews
 */
export const getPersonalizedFeed = async (preferences, limitCount = 10, flavorFilter = null) => {
  try {
    // 1. Fetch a larger batch of recent reviews to filter client-side
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      orderBy('createdAt', 'desc'),
      limit(100) // Fetch 100 candidates
    );
    const snapshot = await getDocs(q);
    const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Score and Filter each review
    const scoredReviews = allReviews.map(review => {
      let score = 0;
      const profile = review.flavorProfile || {};

      // --- Filter Check ---
      if (flavorFilter) {
        if (flavorFilter.acidity > 0 && (profile.acidity || 0) < flavorFilter.acidity) return null;
        if (flavorFilter.sweetness > 0 && (profile.sweetness || 0) < flavorFilter.sweetness) return null;
        if (flavorFilter.body > 0 && (profile.body || 0) < flavorFilter.body) return null;
        if (flavorFilter.bitterness > 0 && (profile.bitterness || 0) < flavorFilter.bitterness) return null;
        if (flavorFilter.aroma > 0 && (profile.aroma || 0) < flavorFilter.aroma) return null;
      }

      // --- Scoring Logic ---

      // Roast Match (High weight)
      if (preferences?.roast && review.roasting) {
        if (preferences.roast.toLowerCase() === review.roasting.toLowerCase()) {
          score += 5;
        }
      }

      // Acidity Match
      if (preferences?.acidity) {
        const acidity = profile.acidity || 3;
        if (preferences.acidity === 'high' && acidity >= 4) score += 3;
        else if (preferences.acidity === 'low' && acidity <= 2) score += 3;
        else if (preferences.acidity === 'medium' && (acidity >= 2 && acidity <= 4)) score += 3;
      }

      // Body Match
      if (preferences?.body) {
        const body = profile.body || 3;
        if (preferences.body === 'heavy' && body >= 4) score += 3;
        else if (preferences.body === 'light' && body <= 2) score += 3;
        else if (preferences.body === 'medium' && (body >= 2 && body <= 4)) score += 3;
      }

      // Base score for recent posts (optional, to keep fresh content relevant)
      // score += 1; 

      return { ...review, score };
    });

    // 3. Filter nulls (filtered out) and Sort
    const personalized = scoredReviews
      .filter(item => item !== null) // Remove filtered items
      .sort((a, b) => b.score - a.score) // Sort by score desc
      .slice(0, limitCount);

    return personalized;
  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    return [];
  }
};

/**
 * Get top rated reviews for ranking
 * @param {number} limitCount - Number of reviews to fetch
 * @returns {Promise<Array>} Array of reviews sorted by rating
 */
export const getTopRatedReviews = async (limitCount = 10) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      orderBy('rating', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching top rated reviews:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index needed for ranking. Please create the index.');
      console.warn(error.message); // Log the message containing the link
      return [];
    }
    throw error;
  }
};
