/**
 * Enrich Cafe Data with Naver Local Search API
 *
 * This script:
 * 1. Fetches all cafes from Firestore
 * 2. For each cafe, searches Naver Local API using cafe name + address
 * 3. Updates Firestore with additional data (thumbnailUrl, phone, category, etc.)
 *
 * Run once to populate cafe data, not on every app load.
 */

const admin = require('firebase-admin');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Naver API credentials
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
  console.error('❌ Error: NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in .env file');
  console.error('Get your API keys from https://developers.naver.com/apps/');
  process.exit(1);
}

/**
 * Search Naver Local API for cafe information
 * @param {string} cafeName - Cafe name
 * @param {string} address - Cafe address
 * @param {Array} locationTags - Location tags from Firestore (e.g., ["서울", "성수"])
 * @returns {Promise<Object|null>} Naver place data or null if not found
 */
async function searchNaverLocal(cafeName, address, locationTags) {
  try {
    // Multi-strategy search: Try multiple queries in order of specificity
    const searchStrategies = [];

    // Strategy 1: Name + specific district (가장 정확)
    if (locationTags && locationTags.length > 1) {
      searchStrategies.push({
        query: `${cafeName} ${locationTags[1]}`,
        description: `name + district (${locationTags[1]})`
      });
    }

    // Strategy 2: Name + city (broader search)
    if (locationTags && locationTags.length > 0) {
      searchStrategies.push({
        query: `${cafeName} ${locationTags[0]}`,
        description: `name + city (${locationTags[0]})`
      });
    }

    // Strategy 3: Name only with "카페" keyword
    searchStrategies.push({
      query: `${cafeName} 카페`,
      description: 'name + "카페" keyword'
    });

    // Strategy 4: Just cafe name (last resort)
    searchStrategies.push({
      query: cafeName,
      description: 'name only'
    });

    // Try each strategy until we get results
    for (const strategy of searchStrategies) {
      const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
        params: {
          query: strategy.query,
          display: 5,
          start: 1,
          sort: 'random'
        },
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        // Filter results: only return if category contains "카페" or "커피"
        const cafeResults = response.data.items.filter(item =>
          item.category && (
            item.category.includes('카페') ||
            item.category.includes('커피') ||
            item.category.includes('디저트')
          )
        );

        if (cafeResults.length > 0) {
          const bestMatch = cafeResults[0];

          console.log(`   ✓ Found with strategy: ${strategy.description}`);

          return {
            title: bestMatch.title.replace(/<\/?b>/g, ''),
            category: bestMatch.category,
            telephone: bestMatch.telephone || '',
            address: bestMatch.address || address,
            roadAddress: bestMatch.roadAddress || '',
            mapx: bestMatch.mapx,
            mapy: bestMatch.mapy,
            link: bestMatch.link || '',
            searchStrategy: strategy.description
          };
        }
      }

      // Add small delay between retry attempts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  } catch (error) {
    console.error(`Error searching Naver for "${cafeName}":`, error.message);
    return null;
  }
}

/**
 * Get a placeholder image URL for cafes
 * Using Unsplash API for free, high-quality cafe/coffee images
 * @param {number} index - Cafe index for variety
 * @returns {string} Image URL
 */
function getPlaceholderImage(index) {
  // Collection of coffee/cafe themed Unsplash images
  const unsplashImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400', // Latte art
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400', // Cafe interior
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', // Coffee cup
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', // Coffee brewing
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400', // Cafe exterior
    'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=400', // Coffee beans
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400', // Espresso
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', // Coffee shop
    'https://images.unsplash.com/photo-1501492673258-26e0a5a64464?w=400', // Barista
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', // Coffee beans close-up
  ];

  return unsplashImages[index % unsplashImages.length];
}

/**
 * Convert Naver coordinates (KATEC) to WGS84 (latitude/longitude)
 * @param {string} mapx - X coordinate from Naver
 * @param {string} mapy - Y coordinate from Naver
 * @returns {Object} { latitude, longitude }
 */
function convertNaverCoordinates(mapx, mapy) {
  // Naver coordinates are in KATEC format, need to convert to WGS84
  // The coordinates are already shifted, we need to convert them back
  const longitude = parseInt(mapx) / 10000000;
  const latitude = parseInt(mapy) / 10000000;

  return {
    latitude,
    longitude
  };
}

/**
 * Enrich a single cafe with Naver data
 * @param {Object} cafe - Cafe document from Firestore
 * @param {number} index - Cafe index for placeholder images
 * @returns {Promise<boolean>} Success status
 */
async function enrichCafe(cafe, index) {
  try {
    console.log(`\n📍 Processing: ${cafe.name}`);

    // Search Naver Local API (will try multiple strategies)
    const naverData = await searchNaverLocal(cafe.name, cafe.address, cafe.locationTags);

    if (!naverData) {
      console.log(`   ⚠️  No Naver data found, using placeholder image`);

      // Still update with placeholder image
      await db.collection('cafes').doc(cafe.id).update({
        thumbnailUrl: getPlaceholderImage(index),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return false;
    }

    console.log(`   ✅ Found on Naver: ${naverData.title}`);
    console.log(`   📞 Phone: ${naverData.telephone || 'N/A'}`);
    console.log(`   🏷️  Category: ${naverData.category}`);

    // Convert coordinates
    let coordinates = cafe.coordinates || {};
    if (naverData.mapx && naverData.mapy) {
      coordinates = convertNaverCoordinates(naverData.mapx, naverData.mapy);
      console.log(`   🗺️  Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
    }

    // Prepare update data
    const updateData = {
      thumbnailUrl: getPlaceholderImage(index), // Use placeholder for now, can be replaced with actual photos later
      phone: naverData.telephone || '',
      category: naverData.category || '',
      naverLink: naverData.link || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add coordinates if available
    if (coordinates.latitude && coordinates.longitude) {
      updateData.coordinates = new admin.firestore.GeoPoint(
        coordinates.latitude,
        coordinates.longitude
      );
    }

    // Update Firestore
    await db.collection('cafes').doc(cafe.id).update(updateData);

    console.log(`   💾 Updated in Firestore`);

    // Add delay to respect API rate limits (10 requests per second)
    await new Promise(resolve => setTimeout(resolve, 150));

    return true;
  } catch (error) {
    console.error(`   ❌ Error enriching ${cafe.name}:`, error.message);
    return false;
  }
}

/**
 * Main function: Enrich all cafes
 */
async function enrichAllCafes() {
  try {
    console.log('🚀 Starting cafe data enrichment...\n');

    // Fetch all cafes
    const cafesSnapshot = await db.collection('cafes').get();
    const cafes = cafesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Found ${cafes.length} cafes in Firestore\n`);

    if (cafes.length === 0) {
      console.log('⚠️  No cafes found. Please add cafes to Firestore first.');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    // Process each cafe
    for (let i = 0; i < cafes.length; i++) {
      const success = await enrichCafe(cafes[i], i);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Enrichment Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully enriched: ${successCount} cafes`);
    console.log(`⚠️  Failed or no data: ${failCount} cafes`);
    console.log(`📊 Total processed: ${cafes.length} cafes`);
    console.log('\n💡 Tip: Check Firebase Console to verify the updated data');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
enrichAllCafes();
