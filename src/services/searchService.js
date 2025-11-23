// Search Service - Firestore 검색 및 검색 기록 관리
// Features: Cafe search, recent searches, trending keywords
// Note: Firestore doesn't support full-text search natively
// For production, consider Algolia or Elasticsearch for advanced search

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Search cafes by name or location
 * @param {string} searchText - Search query
 * @param {number} limitCount - Max results
 * @returns {Promise<Array>} Array of matching cafes
 *
 * Implementation note: Firestore doesn't support full-text search,
 * so we fetch all cafes and filter client-side.
 * For large datasets (>1000 cafes), integrate Algolia or similar service.
 */
export const searchCafes = async (searchText, limitCount = 20) => {
  try {
    // Fetch all cafes (for v0.2, this is acceptable with small dataset)
    const cafesRef = collection(db, 'cafes');
    const q = query(cafesRef, limit(100));

    const snapshot = await getDocs(q);
    const cafes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by search text (case-insensitive)
    const lowerSearch = searchText.toLowerCase().trim();

    const filtered = cafes.filter(cafe => {
      // Search in cafe name
      const nameMatch = cafe.name?.toLowerCase().includes(lowerSearch);

      // Search in address
      const addressMatch = cafe.address?.toLowerCase().includes(lowerSearch);

      // Search in location tags
      const locationTagMatch = cafe.locationTags?.some(tag =>
        tag.toLowerCase().includes(lowerSearch)
      );

      return nameMatch || addressMatch || locationTagMatch;
    });

    return filtered.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching cafes:', error);
    throw error;
  }
};

/**
 * Get recent searches from AsyncStorage
 * @returns {Promise<Array<string>>} Array of recent search terms
 */
export const getRecentSearches = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

/**
 * Add a search term to recent searches
 * @param {string} searchTerm - The search term to save
 *
 * Behavior:
 * - Removes duplicate if exists
 * - Adds new term to beginning of list
 * - Maintains max 10 recent searches
 */
export const addRecentSearch = async (searchTerm) => {
  try {
    const trimmed = searchTerm.trim();
    if (!trimmed) return; // Don't save empty searches

    const recent = await getRecentSearches();

    // Remove if already exists (to avoid duplicates)
    const filtered = recent.filter(term => term !== trimmed);

    // Add to beginning
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

/**
 * Remove a specific search term from recent searches
 * @param {string} searchTerm - The search term to remove
 */
export const removeRecentSearch = async (searchTerm) => {
  try {
    const recent = await getRecentSearches();
    const filtered = recent.filter(term => term !== searchTerm);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing recent search:', error);
  }
};

/**
 * Clear all recent searches
 */
export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

/**
 * Get trending search keywords from review tags
 * @returns {Promise<Array<string>>} Top trending tags
 *
 * Algorithm:
 * - Fetch recent 100 reviews
 * - Count frequency of all tags (basicTags)
 * - Return top 10 most common tags
 *
 * Fallback: Returns default trending keywords if no reviews exist
 */
export const getTrendingKeywords = async () => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(100));

    const snapshot = await getDocs(q);
    const tagCounts = {};

    // Count tag frequency across recent reviews
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const tags = data.basicTags || [];
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count (descending) and return top 10
    const sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Return sorted tags if we have any, otherwise return defaults
    if (sorted.length > 0) {
      return sorted;
    }

    // Fallback to default trending keywords
    return ['산미', '고소한', '달콤한', '라떼', '핸드드립', '뷰맛집', '디카페인', '스페셜티'];
  } catch (error) {
    console.error('Error getting trending keywords:', error);
    // Return default trending keywords on error
    return ['산미', '고소한', '달콤한', '라떼', '핸드드립', '뷰맛집', '디카페인', '스페셜티'];
  }
};

/**
 * Search reviews by keyword
 * @param {string} searchText - Search query
 * @param {number} limitCount - Max results
 * @returns {Promise<Array>} Array of matching reviews
 *
 * Searches in:
 * - Coffee name
 * - Cafe name
 * - Comment text
 * - Tags (basicTags, advancedTags)
 */
export const searchReviews = async (searchText, limitCount = 20) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(100));

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const lowerSearch = searchText.toLowerCase().trim();

    const filtered = reviews.filter(review => {
      // Search in coffee name
      const coffeeMatch = review.coffeeName?.toLowerCase().includes(lowerSearch);

      // Search in cafe name
      const cafeMatch = review.cafeName?.toLowerCase().includes(lowerSearch);

      // Search in comment
      const commentMatch = review.comment?.toLowerCase().includes(lowerSearch);

      // Search in tags
      const tagMatch = [
        ...(review.basicTags || []),
        ...(review.advancedTags || [])
      ].some(tag => tag.toLowerCase().includes(lowerSearch));

      return coffeeMatch || cafeMatch || commentMatch || tagMatch;
    });

    return filtered.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching reviews:', error);
    throw error;
  }
};

/**
 * Get search suggestions based on partial input
 * @param {string} partialText - Partial search text
 * @returns {Promise<Array<string>>} Array of suggestion strings
 *
 * Returns mix of:
 * - Cafe names starting with input
 * - Popular tags matching input
 * - Recent searches matching input
 */
export const getSearchSuggestions = async (partialText) => {
  try {
    if (!partialText || partialText.length < 2) {
      return [];
    }

    const lowerPartial = partialText.toLowerCase();
    const suggestions = new Set();

    // Get cafe name suggestions
    const cafesRef = collection(db, 'cafes');
    const cafesSnapshot = await getDocs(query(cafesRef, limit(50)));

    cafesSnapshot.docs.forEach(doc => {
      const cafe = doc.data();
      if (cafe.name?.toLowerCase().startsWith(lowerPartial)) {
        suggestions.add(cafe.name);
      }
    });

    // Get tag suggestions from trending keywords
    const trending = await getTrendingKeywords();
    trending.forEach(tag => {
      if (tag.toLowerCase().includes(lowerPartial)) {
        suggestions.add(tag);
      }
    });

    // Get matching recent searches
    const recent = await getRecentSearches();
    recent.forEach(term => {
      if (term.toLowerCase().includes(lowerPartial)) {
        suggestions.add(term);
      }
    });

    // Convert to array and limit to 5 suggestions
    return Array.from(suggestions).slice(0, 5);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};
