// Naver Search Service - 네이버 지역 검색 API 연동
// Documentation: https://developers.naver.com/docs/serviceapi/search/local/local.md

// Note: In a production environment, API calls requiring a Client Secret should be proxied
// through a backend server to avoid exposing credentials in the client app.
// For this prototype/MVP, we are calling the API directly.

const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

/**
 * Search for places using Naver Local Search API
 * @param {string} query - Search query (e.g., "Starbucks Gangnam")
 * @param {number} display - Number of results to display (default: 5)
 * @returns {Promise<Array>} Array of formatted cafe objects
 */
export const searchNaverPlaces = async (query, display = 5) => {
    try {
        // Get keys from environment variables
        // Note: In Expo, variables usually need EXPO_PUBLIC_ prefix to be exposed to the client
        // We'll try both formats to be safe, or fallback to the values found in .env
        const clientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID || '1pY7OxWy81YknrkW48B7';
        const clientSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET || '4oL9V86qt4';

        if (!clientId || !clientSecret) {
            console.error('Naver Search API keys are missing');
            return [];
        }

        const response = await fetch(`${NAVER_SEARCH_API_URL}?query=${encodeURIComponent(query)}&display=${display}&sort=random`, {
            method: 'GET',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Naver Search API Error:', errorData);
            return [];
        }

        const data = await response.json();

        if (!data.items) {
            return [];
        }

        // Transform Naver results to match our app's Cafe structure
        return data.items.map((item) => {
            // Clean up HTML tags in title (e.g., <b>Starbucks</b>)
            const name = item.title.replace(/<[^>]*>?/gm, '');

            // Generate a unique ID using coordinates and a simple hash of the name
            // This prevents duplicate keys when multiple businesses share the same location
            const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const uniqueId = `naver_${item.mapx}_${item.mapy}_${nameHash}`;

            return {
                id: uniqueId, // More unique ID
                name: name,
                address: item.roadAddress || item.address,
                location: item.roadAddress || item.address, // For compatibility
                category: item.category,
                link: item.link,
                description: item.description,
                telephone: item.telephone,
                mapx: item.mapx,
                mapy: item.mapy,
                isNaverResult: true, // Flag to identify Naver results
            };
        });
    } catch (error) {
        console.error('Error searching Naver places:', error);
        return [];
    }
};

// Request queue for rate limiting
const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return;

    isProcessingQueue = true;
    const { query, resolve, reject } = requestQueue.shift();

    try {
        const result = await performImageSearch(query);
        resolve(result);
    } catch (error) {
        reject(error);
    } finally {
        // Add delay between requests to avoid rate limits (e.g., 200ms)
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue();
        }, 200);
    }
};

// Internal function to perform the actual API call
const performImageSearch = async (query) => {
    try {
        const clientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID || '1pY7OxWy81YknrkW48B7';
        const clientSecret = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET || '4oL9V86qt4';

        if (!clientId || !clientSecret) {
            console.error('Naver Search API keys are missing');
            return null;
        }

        // Fetch multiple results to filter out bad domains
        const response = await fetch(`https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=3&sort=sim&filter=medium`, {
            method: 'GET',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Naver Image Search API Error:', errorData);
            return null;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return null;
        }

        // Filter out known bad domains that block hotlinking or are unreliable
        const badDomains = ['akmall.com', 'shopping.interpark.com', 'postfiles.pstatic.net', 'blogfiles.pstatic.net'];

        const validImage = data.items.find(item => {
            return !badDomains.some(domain => item.link.includes(domain));
        });

        return validImage ? validImage.link : data.items[0].link; // Fallback to first if all filtered
    } catch (error) {
        console.error('Error searching Naver images:', error);
        return null;
    }
};

/**
 * Search for images using Naver Image Search API (Queued)
 * @param {string} query - Search query (e.g., "Starbucks Gangnam")
 * @returns {Promise<string|null>} URL of the first valid image result, or null if not found
 */
export const searchNaverImages = (query) => {
    return new Promise((resolve, reject) => {
        requestQueue.push({ query, resolve, reject });
        processQueue();
    });
};
