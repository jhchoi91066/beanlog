import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const ACHIEVEMENTS = {
    FIRST_CUP: {
        id: 'first_cup',
        label: 'First Cup',
        icon: 'cafe',
        description: '첫 번째 리뷰를 작성했습니다.',
        condition: (stats) => stats.totalReviews >= 1,
    },
    EXPLORER: {
        id: 'explorer',
        label: 'Explorer',
        icon: 'compass',
        description: '5곳 이상의 카페를 방문했습니다.',
        condition: (stats) => stats.uniqueCafes >= 5,
    },
    MASTER: {
        id: 'master',
        label: 'Master',
        icon: 'trophy',
        description: '10개 이상의 리뷰를 작성했습니다.',
        condition: (stats) => stats.totalReviews >= 10,
    },
    PHOTOGRAPHER: {
        id: 'photographer',
        label: 'Photographer',
        icon: 'camera',
        description: '사진이 포함된 리뷰를 3개 이상 작성했습니다.',
        condition: (stats) => stats.photoReviews >= 3,
    },
    SOCIAL: {
        id: 'social',
        label: 'Social',
        icon: 'people',
        description: '커뮤니티 활동을 시작했습니다.',
        condition: (stats) => false, // Placeholder for future logic
    },
};

/**
 * Check and unlock achievements for a user
 * @param {string} userId 
 * @param {object} currentStats - { totalReviews, uniqueCafes, photoReviews }
 * @returns {Promise<Array>} Array of newly unlocked achievements
 */
export const checkAchievements = async (userId, currentStats) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() || {};
        const unlockedAchievements = userData.achievements || [];

        const newUnlocks = [];

        for (const key in ACHIEVEMENTS) {
            const achievement = ACHIEVEMENTS[key];
            // Check if already unlocked
            if (unlockedAchievements.some(a => a.id === achievement.id)) continue;

            // Check condition
            if (achievement.condition(currentStats)) {
                newUnlocks.push({
                    id: achievement.id,
                    unlockedAt: new Date().toISOString(),
                    label: achievement.label,
                    icon: achievement.icon,
                });
            }
        }

        if (newUnlocks.length > 0) {
            // Update user document
            await setDoc(userRef, {
                achievements: arrayUnion(...newUnlocks)
            }, { merge: true });

            console.log('🎉 New achievements unlocked:', newUnlocks.map(a => a.label));
        }

        return newUnlocks;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

/**
 * Get user's unlocked achievements
 * @param {string} userId 
 */
export const getUserAchievements = async (userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data().achievements || [];
        }
        return [];
    } catch (error) {
        console.error('Error getting user achievements:', error);
        return [];
    }
};
