import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    serverTimestamp,
    getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'follows';

/**
 * Follow a user
 * @param {string} followerId - ID of the user creating the follow
 * @param {string} followingId - ID of the target user to follow
 */
export const followUser = async (followerId, followingId) => {
    try {
        if (!followerId || !followingId) throw new Error('Invalid user IDs');
        if (followerId === followingId) throw new Error('Cannot follow yourself');

        // Check if already following
        const isFollowing = await checkIsFollowing(followerId, followingId);
        if (isFollowing) return;

        await addDoc(collection(db, COLLECTION_NAME), {
            followerId,
            followingId,
            createdAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
};

/**
 * Unfollow a user
 * @param {string} followerId 
 * @param {string} followingId 
 */
export const unfollowUser = async (followerId, followingId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('followerId', '==', followerId),
            where('followingId', '==', followingId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return false;

        // Theoretically should be only one doc, but iterate just in case
        const deletePromises = snapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, COLLECTION_NAME, docSnapshot.id))
        );

        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
};

/**
 * Check if relationship exists
 * @param {string} followerId 
 * @param {string} followingId 
 */
export const checkIsFollowing = async (followerId, followingId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('followerId', '==', followerId),
            where('followingId', '==', followingId)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
};

/**
 * Get count of followers for a user
 * @param {string} userId 
 */
export const getFollowerCount = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('followingId', '==', userId)
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error('Error getting follower count:', error);
        return 0;
    }
};

/**
 * Get count of users followed by a user
 * @param {string} userId 
 */
export const getFollowingCount = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('followerId', '==', userId)
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error('Error getting following count:', error);
        return 0;
    }
};
