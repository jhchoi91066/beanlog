// Feed Service - Community reviews feed management
// Fetches reviews from all users for the community feed

import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';

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
/**
 * Get recent reviews from all users for community feed
 * @param {number} limitCount - Number of reviews to fetch (default 20)
 * @param {Object} lastDoc - The last document snapshot from the previous fetch (for pagination)
 * @returns {Promise<Object>} { reviews: Array, lastVisible: Object }
 */
export const getRecentReviews = async (limitCount = 20, lastDoc = null) => {
  try {
    const reviewsRef = collection(db, 'reviews');

    const qConstraints = [];
    qConstraints.push(orderBy('createdAt', 'desc'));

    if (lastDoc) {
      qConstraints.push(startAfter(lastDoc));
    }

    qConstraints.push(limit(limitCount));

    const q = query(reviewsRef, ...qConstraints);
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { reviews, lastVisible };
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
/**
 * Get reviews filtered by basic tag
 * @param {string} tag - Tag to filter by
 * @param {number} limitCount
 * @param {Object} lastDoc - Cursor for pagination
 * @returns {Promise<Object>} { reviews, lastVisible }
 */
export const getReviewsByTag = async (tag, limitCount = 20, lastDoc = null) => {
  try {
    const reviewsRef = collection(db, 'reviews');

    const qConstraints = [];
    qConstraints.push(where('basicTags', 'array-contains', tag));
    qConstraints.push(orderBy('createdAt', 'desc'));

    if (lastDoc) {
      qConstraints.push(startAfter(lastDoc));
    }

    qConstraints.push(limit(limitCount));

    const q = query(reviewsRef, ...qConstraints);
    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { reviews, lastVisible };
  } catch (error) {
    console.error('Error fetching reviews by tag:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Firestore index needed for tag filtering.');
      return { reviews: [], lastVisible: null };
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
/**
 * Get personalized feed based on user preferences and optional flavor filter
 * @param {Object} preferences - User preferences
 * @param {number} limitCount
 * @param {Object} flavorFilter
 * @param {Object} lastDoc - Cursor for pagination
 * @returns {Promise<Object>} { reviews, lastVisible }
 */
export const getPersonalizedFeed = async (preferences, limitCount = 10, flavorFilter = null, lastDoc = null) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    let q;
    let usingDbFilter = false;

    // console.log('getPersonalizedFeed called with:', { limitCount, hasFilter: !!flavorFilter, hasLastDoc: !!lastDoc });
    // if (lastDoc) console.log('lastDoc type:', lastDoc.constructor.name);

    // 1. Optimize: Use Firestore Query if explicit filter is present
    if (flavorFilter) {
      const activeField = Object.keys(flavorFilter).find(key => flavorFilter[key] > 0);

      if (activeField) {
        // console.log(`[Optimization] Using DB Filter for ${activeField}`);
        const qConstraints = [];
        qConstraints.push(where(`flavorProfile.${activeField}`, '>=', flavorFilter[activeField]));
        qConstraints.push(orderBy(`flavorProfile.${activeField}`, 'desc'));

        if (lastDoc) {
          qConstraints.push(startAfter(lastDoc));
        }

        qConstraints.push(limit(limitCount));

        qConstraints.push(limit(limitCount));

        // console.log('Building DB Filter Query. Constraints:', qConstraints.length);
        q = query(reviewsRef, ...qConstraints);
        usingDbFilter = true;
      }
    }

    // 2. If no DB filter used, fetch recent posts
    if (!usingDbFilter) {
      // console.log('[Optimization] Fetching recent for client-side ranking');
      const qConstraints = [];
      qConstraints.push(orderBy('createdAt', 'desc'));

      if (lastDoc) {
        qConstraints.push(startAfter(lastDoc));
      }

      qConstraints.push(limit(limitCount));

      qConstraints.push(limit(limitCount));

      // console.log('Building Recent Query. Constraints:', qConstraints.length);
      q = query(reviewsRef, ...qConstraints);
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Score and Sort (Client-side)
    const scoredReviews = fetchedReviews.map(review => {
      let score = 0;
      const profile = review.flavorProfile || {};

      // Scoring Logic...
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
    // Note: Re-sorting client side breaks strict generic pagination order if we rely on createdAt for next fetch.
    // For now, infinite scroll on personalized feed mixed with scoring is complex.
    // We will return the reviews sorted by score, but the cursor (lastVisible) corresponds to the DB sort (createdAt or flavor).
    // This might cause some "jumping" or suboptimal ordering across pages, but is acceptable MVP.
    const sortedReviews = scoredReviews.sort((a, b) => b.score - a.score);

    return { reviews: sortedReviews, lastVisible };

  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    if (error.code === 'failed-precondition') {
      console.warn('Index missing, falling back to recent');
      return getRecentReviews(limitCount, lastDoc);
    }
    return { reviews: [], lastVisible: null };
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
