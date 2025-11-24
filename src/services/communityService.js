// Community Service - Manages community posts
// Currently uses in-memory storage for demonstration purposes
// TODO: Migrate to Firebase Firestore

// Mock Data
let MOCK_POSTS = [
    {
        id: '1',
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
    },
    {
        id: '2',
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
    },
    {
        id: '3',
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
    },
    {
        id: '4',
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
    },
    {
        id: '5',
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
    },
];

/**
 * Get all community posts
 * @returns {Promise<Array>} Array of posts
 */
export const getPosts = async () => {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...MOCK_POSTS]);
        }, 500);
    });
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newPost = {
                id: Date.now().toString(),
                ...postData,
                likes: 0,
                comments: 0,
                views: 0,
                timeAgo: '방금 전',
                isLiked: false,
                isBookmarked: false,
                isSolved: false,
            };
            MOCK_POSTS = [newPost, ...MOCK_POSTS];
            resolve(newPost);
        }, 500);
    });
};
