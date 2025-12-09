import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Collection Themes Definition
export const COLLECTIONS = [

    {
        id: 'sweet_tooth',
        title: '🍯 달콤한 여운',
        subtitle: '설탕 없이도 달콤한 스페셜티',
        criteria: { field: 'sweetness', min: 4 }
    },
    {
        id: 'heavy_body',
        title: '🍫 묵직한 바디감',
        subtitle: '입안 가득 차오르는 풍부한 질감',
        criteria: { field: 'body', min: 4 }
    }
];

/**
 * Fetch reviews for a specific collection theme
 * @param {string} collectionId - ID of the collection to fetch
 * @param {number} limitCount - Number of items to fetch (default 5)
 * @returns {Promise<Array>} Array of reviews matching the criteria
 */
export const getCollectionItems = async (collectionId, limitCount = 5) => {
    try {
        const theme = COLLECTIONS.find(c => c.id === collectionId);
        if (!theme) return [];

        const reviewsRef = collection(db, 'reviews');

        // Note: Firestore requires composite indexes for multiple field queries.
        // We will query by the specific flavor field and order by it descending.
        // If this fails due to missing index, we might need to create one in Firebase Console.
        // For now, simple query: flavor >= min

        // Query: Field >= min, Order by Field DESC, Limit N
        const q = query(
            reviewsRef,
            where(`flavorProfile.${theme.criteria.field}`, '>=', theme.criteria.min),
            orderBy(`flavorProfile.${theme.criteria.field}`, 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error(`Error fetching collection ${collectionId}:`, error);
        // Fallback: Return empty array or mock data if needed
        return [];
    }
};

/**
 * Fetch all collections with their items
 * @returns {Promise<Array>} Array of collections with 'items' populated
 */
export const getAllCollections = async () => {
    try {
        const promises = COLLECTIONS.map(async (theme) => {
            const items = await getCollectionItems(theme.id);
            return {
                ...theme,
                items
            };
        });

        const results = await Promise.all(promises);
        // Filter out empty collections
        return results.filter(c => c.items.length > 0);
    } catch (error) {
        console.error('Error fetching all collections:', error);
        return [];
    }
};
