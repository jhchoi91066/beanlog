// Geocode all cafes using Naver Geocoding API
// Converts cafe addresses to coordinates (latitude, longitude)

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const https = require('https');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-Y5CQGv2aHRPTEX4Bm4AumnIaiMGiYKU",
  authDomain: "beanlog-app-459cc.firebaseapp.com",
  projectId: "beanlog-app-459cc",
  storageBucket: "beanlog-app-459cc.firebasestorage.app",
  messagingSenderId: "201972315752",
  appId: "1:201972315752:web:6bc5407026381859ef2ddd",
  measurementId: "G-5LXXL44NKV"
};

// Naver Maps API credentials
const NAVER_CLIENT_ID = 'ywaw0lihwo';
const NAVER_CLIENT_SECRET = '0Xo1con4Iq2bSbA9d56GUMuHLYdamV2PvDhBk2Pd';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Geocode an address using Naver Geocoding API
 * @param {string} address - Korean address
 * @returns {Promise<{latitude: number, longitude: number}|null>}
 */
function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const encodedAddress = encodeURIComponent(address);
    const options = {
      hostname: 'maps.apigw.ntruss.com',
      path: `/map-geocode/v2/geocode?query=${encodedAddress}`,
      method: 'GET',
      headers: {
        'x-ncp-apigw-api-key-id': NAVER_CLIENT_ID,
        'x-ncp-apigw-api-key': NAVER_CLIENT_SECRET,
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.status === 'OK' && response.addresses && response.addresses.length > 0) {
            const result = response.addresses[0];
            resolve({
              latitude: parseFloat(result.y),
              longitude: parseFloat(result.x),
            });
          } else {
            console.warn(`⚠️  No results for address: ${address}`);
            console.warn(`   Status: ${response.status}, Error: ${response.errorMessage || 'N/A'}`);
            resolve(null);
          }
        } catch (error) {
          console.error('Parse error:', error);
          console.error('Raw data:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAllCafes() {
  try {
    console.log('🌍 Starting geocoding for all cafes...\n');

    const cafesRef = collection(db, 'cafes');
    const snapshot = await getDocs(cafesRef);

    console.log(`📊 Found ${snapshot.size} cafes to geocode\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const cafeDoc of snapshot.docs) {
      try {
        const cafeData = cafeDoc.data();

        // Skip if already has coordinates
        if (cafeData.coordinates && cafeData.coordinates.latitude && cafeData.coordinates.longitude) {
          console.log(`⏭️  Skipped (already geocoded): ${cafeData.name}`);
          skippedCount++;
          continue;
        }

        console.log(`🔍 Geocoding: ${cafeData.name} - ${cafeData.address}`);

        // Geocode the address
        const coordinates = await geocodeAddress(cafeData.address);

        if (coordinates) {
          // Update Firestore
          await updateDoc(doc(db, 'cafes', cafeDoc.id), {
            coordinates: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            },
            lastUpdated: new Date(),
          });

          successCount++;
          console.log(`✅ Success: ${cafeData.name} → (${coordinates.latitude}, ${coordinates.longitude})\n`);
        } else {
          errorCount++;
          console.log(`❌ Failed: ${cafeData.name} - No coordinates found\n`);
        }

        // Rate limiting: Wait 100ms between requests to avoid API limits
        await sleep(100);

      } catch (error) {
        errorCount++;
        console.error(`❌ Error geocoding ${cafeDoc.data().name}:`, error.message, '\n');
      }
    }

    console.log('\n📈 Geocoding Summary:');
    console.log(`   Total cafes: ${snapshot.size}`);
    console.log(`   ✅ Successfully geocoded: ${successCount}`);
    console.log(`   ⏭️  Skipped (already done): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('\n✨ Geocoding completed!');

  } catch (error) {
    console.error('💥 Geocoding failed:', error);
    process.exit(1);
  }
}

// Check for Client Secret
if (NAVER_CLIENT_SECRET === 'your_client_secret_here') {
  console.error('❌ Error: Please add your Naver Client Secret to this script');
  console.log('\nTo get your Client Secret:');
  console.log('1. Go to https://www.ncloud.com/');
  console.log('2. Navigate to Console → AI·NAVER API → My Application');
  console.log('3. Find your "BeanLog" application');
  console.log('4. Copy the Client Secret');
  console.log('5. Replace "your_client_secret_here" in this file\n');
  process.exit(1);
}

// Run geocoding
geocodeAllCafes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
