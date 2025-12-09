import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Follow a user
 * @param {string} currentUserId - ID of the user performing the follow
 * @param {string} targetUserId - ID of the user to be followed
 */
export const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    try {
        // 1. Create a document in 'follows' collection
        // Structure: follows/{followerId_followingId}
        const followId = `${currentUserId}_${targetUserId}`;
        await setDoc(doc(db, 'follows', followId), {
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: serverTimestamp()
        });

        // Optional: Update follower/following counts in user profiles (omitted for simplicity, can be done via Cloud Functions)
        console.log(`User ${currentUserId} followed ${targetUserId}`);
    } catch (error) {
        console.error('Error following user:', error);
        throw error;
    }
};

/**
 * Unfollow a user
 * @param {string} currentUserId 
 * @param {string} targetUserId 
 */
export const unfollowUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) return;

    try {
        const followId = `${currentUserId}_${targetUserId}`;
        await deleteDoc(doc(db, 'follows', followId));
        console.log(`User ${currentUserId} unfollowed ${targetUserId}`);
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
};

/**
 * Check if current user is following target user
 * @param {string} currentUserId 
 * @param {string} targetUserId 
 * @returns {Promise<boolean>}
 */
export const checkIsFollowing = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) return false;

    try {
        const followId = `${currentUserId}_${targetUserId}`;
        const docRef = doc(db, 'follows', followId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
};

/**
 * Get list of users that the target user is following
 * @param {string} userId 
 * @returns {Promise<Array>} Array of following user IDs
 */
export const getFollowing = async (userId) => {
    try {
        const q = query(collection(db, 'follows'), where('followerId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().followingId);
    } catch (error) {
        console.error('Error getting following list:', error);
        return [];
    }
};

/**
 * Get list of followers for the target user
 * @param {string} userId 
 * @returns {Promise<Array>} Array of follower user IDs
 */
export const getFollowers = async (userId) => {
    try {
        const q = query(collection(db, 'follows'), where('followingId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data().followerId);
    } catch (error) {
        console.error('Error getting followers list:', error);
        return [];
    }
};
