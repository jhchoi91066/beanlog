// Migrate cafes collection - Add enhanced fields for v0.2
// Run this script to update existing cafes

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateCafes() {
  try {
    console.log('🔄 Starting cafes schema migration...');

    const cafesRef = collection(db, 'cafes');
    const snapshot = await getDocs(cafesRef);

    console.log(`📊 Found ${snapshot.size} cafes to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const cafeDoc of snapshot.docs) {
      try {
        const cafeData = cafeDoc.data();

        // Prepare update data
        const updateData = {};

        // Add new fields if they don't exist
        if (!cafeData.coordinates) {
          updateData.coordinates = null; // Will be filled by geocoding script
        }

        if (!cafeData.instagramHandle) {
          updateData.instagramHandle = null;
        }

        if (!cafeData.instagramUrl) {
          updateData.instagramUrl = null;
        }

        if (!cafeData.closedDays) {
          updateData.closedDays = []; // Array of day names: ['Monday', 'Tuesday']
        }

        if (!cafeData.parkingInfo) {
          updateData.parkingInfo = null; // e.g., "주차 가능", "주차 불가", "유료 주차"
        }

        if (!cafeData.phoneNumber) {
          updateData.phoneNumber = null;
        }

        if (!cafeData.lastUpdated) {
          updateData.lastUpdated = new Date();
        }

        if (!cafeData.addressDetail) {
          updateData.addressDetail = null; // Detailed address (building, floor, etc.)
        }

        if (!cafeData.placeId) {
          updateData.placeId = null; // Naver/Kakao place ID for map integration
        }

        // Only update if there are fields to add
        if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, 'cafes', cafeDoc.id), updateData);
          successCount++;
          console.log(`✅ Migrated cafe: ${cafeData.name} (${cafeDoc.id})`);
        } else {
          console.log(`⏭️  Skipped cafe (already migrated): ${cafeData.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating cafe ${cafeDoc.id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total cafes: ${snapshot.size}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('\n✨ Cafes schema migration completed!');
    console.log('\n📍 Next step: Run geocoding script to add coordinates');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCafes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
