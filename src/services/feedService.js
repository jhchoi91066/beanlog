// Feed Service - Community reviews feed management
// Fetches reviews from all users for the community feed

import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

import { db } from './firebase';
import { MOCK_POSTS } from './mockData';

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
    const reviewsRef = collection(db, 'reviews');
    let q;
    let usingDbFilter = false;

    // 1. Optimize: Use Firestore Query if explicit filter is present
    // This reduces reads from 100 -> limitCount (huge cost saving)
    if (flavorFilter) {
      // Find the active filter field (assuming single select for now or prioritizing one)
      // We prioritize the field with the highest value
      const activeField = Object.keys(flavorFilter).find(key => flavorFilter[key] > 0);

      if (activeField) {
        console.log(`[Optimization] Using DB Filter for ${activeField}`);
        q = query(
          reviewsRef,
          where(`flavorProfile.${activeField}`, '>=', flavorFilter[activeField]),
          orderBy(`flavorProfile.${activeField}`, 'desc'),
          limit(limitCount)
        );
        usingDbFilter = true;
      }
    }

    // 2. If no DB filter used, fetch recent posts (but limit to 30 instead of 100 for cost efficiency)
    if (!usingDbFilter) {
      console.log('[Optimization] Fetching recent for client-side ranking (Limit 30)');
      q = query(
        reviewsRef,
        orderBy('createdAt', 'desc'),
        limit(30) // Reduced from 100 to 30 for cost optimization
      );
    }

    const snapshot = await getDocs(q);
    const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Score and Sort (Client-side)
    // Even if we used DB filter, we still score them to respect user preferences
    const scoredReviews = fetchedReviews.map(review => {
      let score = 0;
      const profile = review.flavorProfile || {};

      // --- Scoring Logic ---
      // Roast Match
      if (preferences?.roast && review.roasting) {
        if (preferences.roast.toLowerCase() === review.roasting.toLowerCase()) score += 5;
      }

      // Acidity Match
      if (preferences?.acidity) {
        const acidity = profile.acidity || 3;
        if (preferences.acidity === 'high' && acidity >= 4) score += 3;
        else if (preferences.acidity === 'low' && acidity <= 2) score += 3;
      }

      // Body Match
      if (preferences?.body) {
        const body = profile.body || 3;
        if (preferences.body === 'heavy' && body >= 4) score += 3;
        else if (preferences.body === 'light' && body <= 2) score += 3;
      }

      return { ...review, score };
    });

    // 4. Sort by score desc
    return scoredReviews.sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    // Fallback to recent if query fails (e.g., missing index)
    if (error.code === 'failed-precondition') {
      console.warn('Index missing, falling back to recent');
      return getRecentReviews(limitCount);
    }
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
/**
 * Get reviews by user ID
 * @param {string} userId
 * @returns {Promise<Array>} Array of reviews for the user
 */
export const getReviewsByUserId = async (userId) => {
  // Handle mock users
  if (userId && userId.startsWith('mock-')) {
    console.log('Fetching mock reviews for:', userId);
    return MOCK_POSTS.filter(post => post.userId === userId);
  }

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
    // If index missing, return empty but warn
    if (error.code === 'failed-precondition') {
      console.warn('Index needed for user profile reviews.');
      return [];
    }
    throw error;
  }
};
