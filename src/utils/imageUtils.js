import { CAFE_PLACEHOLDERS } from '../constants/placeholders';

/**
 * Get a random placeholder image for a cafe based on tags
 * @param {Array<string>} tags - Array of tags (e.g., ['라떼맛집', '뷰맛집'])
 * @returns {string} Image URL
 */
export const getCafePlaceholderImage = (tags = [], coffeeName = '') => {
    // Normalize inputs
    const normalizedTags = tags.map(tag => tag.toLowerCase());
    const normalizedCoffeeName = coffeeName.toLowerCase();

    // Check for matching categories
    let category = 'DEFAULT';

    // 1. Check Coffee Name (High Priority)
    if (normalizedCoffeeName.includes('라떼') || normalizedCoffeeName.includes('플랫화이트') || normalizedCoffeeName.includes('카푸치노') || normalizedCoffeeName.includes('바닐라')) {
        category = 'LATTE';
    } else if (normalizedCoffeeName.includes('드립') || normalizedCoffeeName.includes('필터') || normalizedCoffeeName.includes('브루잉') || normalizedCoffeeName.includes('게이샤')) {
        category = 'DRIP';
    } else if (normalizedCoffeeName.includes('아인슈페너') || normalizedCoffeeName.includes('크림')) {
        category = 'DESSERT'; // Sweet/Dessert-like coffee
    }

    // 2. Check Tags if no category found yet
    if (category === 'DEFAULT') {
        if (normalizedTags.some(tag => tag.includes('라떼') || tag.includes('우유') || tag.includes('고소한') || tag.includes('묵직한'))) {
            category = 'LATTE'; // Nutty/Heavy often implies espresso/milk or dark roast
        } else if (normalizedTags.some(tag => tag.includes('드립') || tag.includes('필터') || tag.includes('산미') || tag.includes('꽃향기') || tag.includes('과일'))) {
            category = 'DRIP'; // Acidity/Floral often implies drip/light roast
        } else if (normalizedTags.some(tag => tag.includes('디저트') || tag.includes('케이크') || tag.includes('달콤한') || tag.includes('초콜릿'))) {
            category = 'DESSERT';
        } else if (normalizedTags.some(tag => tag.includes('뷰') || tag.includes('인테리어') || tag.includes('분위기'))) {
            category = 'VIEW';
        }
    }

    // Get images for the selected category
    const images = CAFE_PLACEHOLDERS[category] || CAFE_PLACEHOLDERS.DEFAULT;

    // Pick a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};
