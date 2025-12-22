import { useInfiniteQuery } from '@tanstack/react-query';
import { getPersonalizedFeed, getRecentReviews } from '../services/feedService';

export const FEED_QUERY_KEY = 'feed';

/**
 * Custom hook to fetch personalized feed with pagination
 * @param {Object} preferences - User data preferences
 * @param {Object} filter - Active flavor filter
 * @param {boolean} enabled - Whether query should run
 */
export const useFeedQuery = (preferences, filter, enabled = true) => {
    return useInfiniteQuery({
        queryKey: [FEED_QUERY_KEY, preferences, filter],
        queryFn: async ({ pageParam = null }) => {
            const limit = 10;
            const hasFilter = filter && Object.values(filter).some(v => v > 0);

            // Fetch Logic
            let result;
            if (!preferences && !hasFilter) {
                result = await getRecentReviews(limit, pageParam);
            } else {
                result = await getPersonalizedFeed(preferences || {}, limit, filter, pageParam);

                // Fallback for empty personalized feed (only on first page)
                if ((!result.reviews || result.reviews.length === 0) && !hasFilter && !pageParam) {
                    result = await getRecentReviews(limit, pageParam);
                }
            }

            return result; // { reviews, lastVisible }
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
            // lastPage is { reviews, lastVisible }
            if (!lastPage || !lastPage.lastVisible || lastPage.reviews.length === 0) {
                return undefined; // No more pages
            }
            return lastPage.lastVisible;
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
};
