import { useQuery } from '@tanstack/react-query';
import { getPersonalizedFeed, getRecentReviews } from '../services/feedService';

export const FEED_QUERY_KEY = 'feed';

/**
 * Custom hook to fetch personalized feed
 * @param {Object} preferences - User data preferences
 * @param {Object} filter - Active flavor filter
 * @param {boolean} enabled - Whether query should run (e.g. strict mode)
 */
export const useFeedQuery = (preferences, filter, enabled = true) => {
    return useQuery({
        queryKey: [FEED_QUERY_KEY, preferences, filter],
        queryFn: async () => {
            // Logic from FeedHomeScreen: prioritize personalization
            // If no prefs and no filter, getRecentReviews
            // Otherwise getPersonalizedFeed
            const hasFilter = filter && Object.values(filter).some(v => v > 0);

            if (!preferences && !hasFilter) {
                return getRecentReviews(20);
            }

            const reviews = await getPersonalizedFeed(preferences || {}, 20, filter);

            if (reviews.length === 0 && !hasFilter) {
                return getRecentReviews(20);
            }
            return reviews;
        },
        enabled: enabled, // Only run when enabled is true
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes (no refetch)
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 mins
    });
};
