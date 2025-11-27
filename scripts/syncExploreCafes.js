/**
 * Sync Explore Tab Cafes to Main Cafes Collection
 *
 * This script:
 * 1. Reads trendingCafes collection
 * 2. Creates corresponding cafes in the main cafes collection
 * 3. Updates trendingCafes to reference the real cafe IDs
 * 4. Enriches the new cafes with Naver API data
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

/**
 * Search Naver Local API for cafe information
 */
async function searchNaverLocal(cafeName, locationHint) {
  try {
    const searchStrategies = [
      { query: `${cafeName} ${locationHint}`, description: `name + location (${locationHint})` },
      { query: `${cafeName} 카페`, description: 'name + "카페" keyword' },
      { query: cafeName, description: 'name only' }
    ];

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
            address: bestMatch.address || '',
            roadAddress: bestMatch.roadAddress || '',
            mapx: bestMatch.mapx,
            mapy: bestMatch.mapy,
            link: bestMatch.link || '',
          };
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  } catch (error) {
    console.error(`Error searching Naver for "${cafeName}":`, error.message);
    return null;
  }
}

/**
 * Convert Naver coordinates to WGS84
 */
function convertNaverCoordinates(mapx, mapy) {
  const longitude = parseInt(mapx) / 10000000;
  const latitude = parseInt(mapy) / 10000000;
  return { latitude, longitude };
}

/**
 * Get placeholder image
 */
function getPlaceholderImage(index) {
  const unsplashImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
    'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=400',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    'https://images.unsplash.com/photo-1501492673258-26e0a5a64464?w=400',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
  ];
  return unsplashImages[index % unsplashImages.length];
}

/**
 * Create or update cafe in main collection
 */
async function syncCafe(trendingCafe, index) {
  try {
    console.log(`\n📍 Processing: ${trendingCafe.name}`);

    // Get location from data
    const location = trendingCafe.location || '';

    // Determine locationTags
    let locationTags = [];
    if (location === '강릉') {
      locationTags = ['강원도', '강릉'];
    } else if (location === '부산') {
      locationTags = ['부산', '해운대'];
    } else if (location === '서울') {
      // Parse more specific location from address if available
      const addressMatch = trendingCafe.address?.match(/(종로|성수|강남|연남|용산|마포)/);
      const district = addressMatch ? addressMatch[0] : '성수';
      locationTags = ['서울', district];
    } else {
      locationTags = ['서울', '성수'];
    }

    // Search Naver for additional info (optional, since we already have good data)
    const naverData = NAVER_CLIENT_ID ? await searchNaverLocal(trendingCafe.name, location) : null;

    // Prepare cafe data - use existing data from trendingCafes
    const cafeData = {
      name: trendingCafe.name,
      locationTags: locationTags,
      address: trendingCafe.address || '',
      thumbnailUrl: trendingCafe.image || getPlaceholderImage(index),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add coordinates if available
    if (trendingCafe.latitude && trendingCafe.longitude) {
      cafeData.coordinates = new admin.firestore.GeoPoint(
        trendingCafe.latitude,
        trendingCafe.longitude
      );
      console.log(`   🗺️  Coordinates: ${trendingCafe.latitude}, ${trendingCafe.longitude}`);
    }

    // Add Naver data if found
    if (naverData) {
      console.log(`   ✓ Found on Naver: ${naverData.title}`);
      console.log(`   📞 Phone: ${naverData.telephone || 'N/A'}`);
      console.log(`   🏷️  Category: ${naverData.category}`);

      cafeData.address = naverData.address;
      cafeData.phone = naverData.telephone;
      cafeData.category = naverData.category;
      cafeData.naverLink = naverData.link;

      if (naverData.mapx && naverData.mapy) {
        const coordinates = convertNaverCoordinates(naverData.mapx, naverData.mapy);
        cafeData.coordinates = new admin.firestore.GeoPoint(
          coordinates.latitude,
          coordinates.longitude
        );
        console.log(`   🗺️  Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
      }
    } else {
      console.log(`   ⚠️  Not found on Naver, using basic data`);
      cafeData.address = locationTags.join(' ');
    }

    // Create cafe in main collection
    const cafeRef = await db.collection('cafes').add(cafeData);
    console.log(`   ✅ Created cafe with ID: ${cafeRef.id}`);

    // Update trending cafe to reference the real cafe
    await db.collection('trendingCafes').doc(trendingCafe.id).update({
      cafeId: cafeRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`   🔗 Updated trendingCafe reference`);

    await new Promise(resolve => setTimeout(resolve, 150));

    return cafeRef.id;
  } catch (error) {
    console.error(`   ❌ Error syncing ${trendingCafe.title}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function syncAllExploreCafes() {
  try {
    console.log('🚀 Starting Explore Cafes Sync...\n');

    // Fetch trending cafes
    const trendingSnapshot = await db.collection('trendingCafes').get();
    const trendingCafes = trendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Found ${trendingCafes.length} trending cafes\n`);

    if (trendingCafes.length === 0) {
      console.log('⚠️  No trending cafes found.');
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;

    // Process each trending cafe
    for (let i = 0; i < trendingCafes.length; i++) {
      const cafe = trendingCafes[i];

      // Skip if already has cafeId
      if (cafe.cafeId) {
        console.log(`\n⏭️  ${cafe.name} already has cafeId: ${cafe.cafeId}`);
        successCount++;
        continue;
      }

      const cafeId = await syncCafe(cafe, i);
      if (cafeId) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Sync Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully synced: ${successCount} cafes`);
    console.log(`⚠️  Failed: ${failCount} cafes`);
    console.log(`📊 Total processed: ${trendingCafes.length} cafes`);
    console.log('\n💡 Tip: Check Firebase Console to verify the data');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
syncAllExploreCafes();
