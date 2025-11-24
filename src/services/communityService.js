// Community Service - Manages community posts
// Integrated with Firebase Firestore

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Share } from 'react-native';

// Mock Data (preserved for design purposes - shown when Firebase is empty)
const MOCK_POSTS = [
    {
        id: 'mock-1',
        type: 'question',
        title: '에스프레소 추출 시간이 너무 빠른데 원인이 뭘까요?',
        content: '새로 산 그라인더로 추출하는데 18초만에 2온스가 나와버려요. 분쇄도를 더 곱게 해야 할까요? 아니면 다른 문제일까요?',
        author: {
            name: '커피초보',
            avatar: 'https://i.pravatar.cc/150?u=user1',
            level: 'Starter',
        },
        tags: ['에스프레소', '추출', '그라인더'],
        likes: 23,
        comments: 15,
        views: 342,
        timeAgo: '30분 전',
        category: '추출 기술',
        isSolved: false,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: 'mock-2',
        type: 'tip',
        title: '홈카페에서 라떼아트 연습하는 5가지 팁',
        content: '1년간 연습한 결과 깨달은 것들을 정리해봤어요. 우유 스티밍 온도, 각도, 푸어링 타이밍 등 실전 팁들입니다.',
        author: {
            name: '라떼마스터',
            avatar: 'https://i.pravatar.cc/150?u=user2',
            level: 'Expert',
        },
        tags: ['라떼아트', '홈카페', '우유스티밍'],
        likes: 156,
        comments: 34,
        views: 1289,
        timeAgo: '2시간 전',
        category: '팁&노하우',
        isBookmarked: true,
        isLiked: false,
    },
    {
        id: 'mock-3',
        type: 'discussion',
        title: '에티오피아 vs 콜롬비아, 산미 좋아하면 어디 원두가 더 좋을까요?',
        content: '산미를 선호하는데 에티오피아 예가체프와 콜롬비아 수프리모 중에 고민됩니다. 둘 다 마셔보신 분들 의견이 궁금해요!',
        author: {
            name: '원두탐험가',
            avatar: 'https://i.pravatar.cc/150?u=user3',
            level: 'Pro',
        },
        tags: ['원두', '산미', '에티오피아', '콜롬비아'],
        likes: 45,
        comments: 28,
        views: 567,
        timeAgo: '4시간 전',
        category: '원두&로스팅',
        isLiked: true,
        isBookmarked: false,
    },
    {
        id: 'mock-4',
        type: 'question',
        title: '핸드드립 온도는 몇도가 가장 적당한가요?',
        content: '보통 92-96도 사이라고 하던데, 원두에 따라 다른가요? 요즘 케냐 원두 사용 중인데 너무 뜨거운 물로 하면 쓴맛이 나는 것 같아요.',
        author: {
            name: '드립러버',
            avatar: 'https://i.pravatar.cc/150?u=user4',
            level: 'Barista',
        },
        tags: ['핸드드립', '온도', '추출'],
        likes: 67,
        comments: 42,
        views: 892,
        timeAgo: '6시간 전',
        category: '추출 기술',
        isSolved: true,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: 'mock-5',
        type: 'tip',
        title: '카페에서 일하며 배운 우유 거품 만드는 비법',
        content: '바리스타로 일한 지 3년차인데, 처음 배울 때 몰랐던 것들을 공유합니다. 특히 우유 온도 체크하는 팁이 유용할 거예요.',
        author: {
            name: '바리스타김',
            avatar: 'https://i.pravatar.cc/150?u=user5',
            level: 'Expert',
        },
        tags: ['바리스타', '우유거품', '카페'],
        likes: 189,
        comments: 56,
        views: 2134,
        timeAgo: '1일 전',
        category: '팁&노하우',
        isLiked: false,
        isBookmarked: false,
    },
];

/**
 * Helper: Convert Firestore timestamp to "time ago" string
 */
const getTimeAgo = (timestamp) => {
  if (!timestamp) return '방금 전';

  const now = new Date();
  const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
};

/**
 * Get all community posts
 * Falls back to MOCK_POSTS if Firebase is empty
 * @returns {Promise<Array>} Array of posts
 */
export const getPosts = async () => {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);

        const currentUserId = auth.currentUser?.uid;

        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timeAgo: getTimeAgo(data.createdAt),
                // Check if current user liked/bookmarked this post
                isLiked: data.likedBy?.includes(currentUserId) || false,
                isBookmarked: data.bookmarkedBy?.includes(currentUserId) || false,
            };
        });

        // If Firebase is empty, return MOCK_POSTS
        if (posts.length === 0) {
            console.log('📝 Using mock posts (Firebase is empty)');
            return MOCK_POSTS;
        }

        // Combine Firebase posts with MOCK_POSTS
        return [...posts, ...MOCK_POSTS];
    } catch (error) {
        console.error('Error fetching posts:', error);
        // On error, return MOCK_POSTS
        return MOCK_POSTS;
    }
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to create a post');
        }

        const newPost = {
            ...postData,
            userId: currentUser.uid,
            likes: 0,
            comments: 0,
            views: 0,
            likedBy: [],
            bookmarkedBy: [],
            isSolved: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'posts'), newPost);

        return {
            id: docRef.id,
            ...newPost,
            createdAt: new Date(),
            timeAgo: '방금 전',
            isLiked: false,
            isBookmarked: false,
        };
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Post object
 */
export const getPostById = async (postId) => {
    try {
        // Check if it's a mock post
        if (postId.startsWith('mock-')) {
            return MOCK_POSTS.find(p => p.id === postId);
        }

        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (!postDoc.exists()) {
            throw new Error('Post not found');
        }

        const data = postDoc.data();
        const currentUserId = auth.currentUser?.uid;

        return {
            id: postDoc.id,
            ...data,
            timeAgo: getTimeAgo(data.createdAt),
            isLiked: data.likedBy?.includes(currentUserId) || false,
            isBookmarked: data.bookmarkedBy?.includes(currentUserId) || false,
        };
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
};

/**
 * Toggle like on a post
 * @param {string} postId - Post ID
 * @returns {Promise<Object>} Updated like status
 */
export const toggleLike = async (postId) => {
    try {
        // Mock posts cannot be liked
        if (postId.startsWith('mock-')) {
            console.log('Cannot like mock posts');
            return { isLiked: false, likes: 0 };
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to like a post');
        }

        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            throw new Error('Post not found');
        }

        const data = postDoc.data();
        const likedBy = data.likedBy || [];
        const isLiked = likedBy.includes(currentUser.uid);

        if (isLiked) {
            // Unlike
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: arrayRemove(currentUser.uid),
            });
            return { isLiked: false, likes: (data.likes || 0) - 1 };
        } else {
            // Like
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(currentUser.uid),
            });
            return { isLiked: true, likes: (data.likes || 0) + 1 };
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};

/**
 * Toggle bookmark on a post
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} New bookmark status
 */
export const toggleBookmark = async (postId) => {
    try {
        // Mock posts cannot be bookmarked
        if (postId.startsWith('mock-')) {
            console.log('Cannot bookmark mock posts');
            return false;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to bookmark a post');
        }

        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            throw new Error('Post not found');
        }

        const data = postDoc.data();
        const bookmarkedBy = data.bookmarkedBy || [];
        const isBookmarked = bookmarkedBy.includes(currentUser.uid);

        if (isBookmarked) {
            // Remove bookmark
            await updateDoc(postRef, {
                bookmarkedBy: arrayRemove(currentUser.uid),
            });
            return false;
        } else {
            // Add bookmark
            await updateDoc(postRef, {
                bookmarkedBy: arrayUnion(currentUser.uid),
            });
            return true;
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        throw error;
    }
};

/**
 * Increment view count for a post
 * @param {string} postId - Post ID
 */
export const incrementViews = async (postId) => {
    try {
        // Mock posts views cannot be incremented
        if (postId.startsWith('mock-')) {
            return;
        }

        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            views: increment(1),
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
        // Don't throw - views are not critical
    }
};

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} commentText - Comment text
 * @returns {Promise<Object>} Created comment
 */
export const addComment = async (postId, commentText) => {
    try {
        // Mock posts cannot have comments
        if (postId.startsWith('mock-')) {
            throw new Error('Cannot comment on mock posts');
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to comment');
        }

        const comment = {
            userId: currentUser.uid,
            userName: currentUser.displayName || '익명 사용자',
            userAvatar: currentUser.photoURL || 'https://i.pravatar.cc/150?u=default',
            text: commentText,
            createdAt: serverTimestamp(),
        };

        // Add comment to comments subcollection
        const commentRef = await addDoc(
            collection(db, 'posts', postId, 'comments'),
            comment
        );

        // Increment comment count on post
        await updateDoc(doc(db, 'posts', postId), {
            comments: increment(1),
        });

        return {
            id: commentRef.id,
            ...comment,
            createdAt: new Date(),
            timeAgo: '방금 전',
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of comments
 */
export const getComments = async (postId) => {
    try {
        // Mock posts have no comments
        if (postId.startsWith('mock-')) {
            return [];
        }

        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timeAgo: getTimeAgo(doc.data().createdAt),
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

/**
 * Share a post
 * @param {Object} post - Post object
 */
export const sharePost = async (post) => {
    try {
        const shareContent = {
            title: post.title,
            message: `${post.title}\n\n${post.content}\n\n- ${post.author.name}`,
        };

        await Share.share(shareContent);
    } catch (error) {
        console.error('Error sharing post:', error);
        // Don't throw - sharing is not critical
    }
};

/**
 * Update a post
 * @param {string} postId - Post ID
 * @param {Object} updateData - Data to update (title, content, tags, etc.)
 * @returns {Promise<Object>} Updated post data
 */
export const updatePost = async (postId, updateData) => {
    try {
        // Mock posts cannot be updated
        if (postId.startsWith('mock-')) {
            throw new Error('Cannot update mock posts');
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to update a post');
        }

        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            throw new Error('Post not found');
        }

        const postData = postDoc.data();

        // Verify user is the author
        if (postData.userId !== currentUser.uid) {
            throw new Error('Only the author can update this post');
        }

        // Update the post
        await updateDoc(postRef, {
            ...updateData,
            updatedAt: serverTimestamp(),
        });

        return {
            id: postId,
            ...postData,
            ...updateData,
            updatedAt: new Date(),
        };
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};

/**
 * Delete a post
 * @param {string} postId - Post ID
 */
export const deletePost = async (postId) => {
    try {
        // Mock posts cannot be deleted
        if (postId.startsWith('mock-')) {
            throw new Error('Cannot delete mock posts');
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User must be authenticated to delete a post');
        }

        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            throw new Error('Post not found');
        }

        const postData = postDoc.data();

        // Verify user is the author
        if (postData.userId !== currentUser.uid) {
            throw new Error('Only the author can delete this post');
        }

        // Delete the post
        await deleteDoc(postRef);
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};
