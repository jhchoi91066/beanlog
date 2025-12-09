import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const MOCK_USERS = [
    {
        userId: 'mock_user_1',
        displayName: 'Barista Kim',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    {
        userId: 'mock_user_2',
        displayName: 'Coffee Lover',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    },
    {
        userId: 'mock_user_3',
        displayName: 'Cafe Explorer',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    }
];

const MOCK_REVIEWS = [
    {
        cafeName: 'Blue Bottle',
        coffeeName: 'Bella Donovan',
        description: 'Perfect balance of richness and berry notes. My daily driver.',
        rating: 5,
        tags: ['Drip', 'Blend', 'Berry'],
        flavorProfile: { acidity: 3, sweetness: 4, body: 4, bitterness: 2, aroma: 5 },
        imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800',
    },
    {
        cafeName: 'Starbucks Reserve',
        coffeeName: 'Microblend No. 21',
        description: 'Dark chocolate notes with a smooth finish. Great for espresso.',
        rating: 4,
        tags: ['Espresso', 'Dark Roast', 'Chocolate'],
        flavorProfile: { acidity: 2, sweetness: 3, body: 5, bitterness: 4, aroma: 4 },
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    },
    {
        cafeName: 'Anthracite',
        coffeeName: 'William Blake',
        description: 'Complex and floral. A bit too acidic for some, but I loved it.',
        rating: 4.5,
        tags: ['Pour Over', 'Single Origin', 'Floral'],
        flavorProfile: { acidity: 5, sweetness: 3, body: 2, bitterness: 1, aroma: 5 },
        imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
    }
];

export const seedMockData = async () => {
    try {
        const reviewsRef = collection(db, 'reviews');

        for (let i = 0; i < 5; i++) {
            const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
            const review = MOCK_REVIEWS[Math.floor(Math.random() * MOCK_REVIEWS.length)];

            await addDoc(reviewsRef, {
                userId: user.userId,
                userDisplayName: user.displayName,
                userPhotoURL: user.photoURL,
                author: {
                    name: user.displayName,
                    avatar: user.photoURL,
                },
                cafeName: review.cafeName,
                coffeeName: review.coffeeName,
                description: review.description,
                rating: review.rating,
                tags: review.tags,
                flavorProfile: review.flavorProfile,
                imageUrl: review.imageUrl,
                likes: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 10),
                createdAt: serverTimestamp(),
            });
        }
        console.log('✅ Mock data seeded successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error seeding mock data:', error);
        return false;
    }
};
