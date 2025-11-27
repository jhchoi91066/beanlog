/**
 * Explore Service
 * Handles fetching explore tab data (trending cafes, collections, categories)
 */

import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

/**
 * Get trending cafes from Firestore
 * @returns {Promise<Array>} List of trending cafes with cafeId reference
 */
export async function getTrendingCafes() {
  try {
    const trendingRef = collection(db, 'trendingCafes');
    const q = query(trendingRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const trendingCafes = snapshot.docs.map(doc => ({
      id: doc.data().cafeId || doc.id, // Use cafeId for navigation, fallback to doc id
      firestoreId: doc.id, // Keep original trendingCafes doc id
      name: doc.data().name,
      location: doc.data().location,
      image: doc.data().image,
      trend: doc.data().trend || '+10%',
      ...doc.data(),
    }));

    return trendingCafes;
  } catch (error) {
    console.error('Error fetching trending cafes:', error);
    throw error;
  }
}

/**
 * Get curated collections from Firestore
 * @returns {Promise<Array>} List of curated collections
 */
export async function getCuratedCollections() {
  try {
    const collectionsRef = collection(db, 'collections');
    const q = query(collectionsRef, orderBy('createdAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);

    const collections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return collections;
  } catch (error) {
    console.error('Error fetching curated collections:', error);
    throw error;
  }
}

/**
 * Get categories from Firestore
 * @returns {Promise<Array>} List of categories
 */
export async function getCategories() {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
