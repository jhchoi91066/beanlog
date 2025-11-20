// Migrate reviews collection - Add photoUrls and updatedAt fields
// Run this script to update existing reviews for v0.2

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase configuration (same as in src/services/firebase.js)
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

async function migrateReviews() {
  try {
    console.log('🔄 Starting reviews schema migration...');

    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);

    console.log(`📊 Found ${snapshot.size} reviews to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const reviewDoc of snapshot.docs) {
      try {
        const reviewData = reviewDoc.data();

        // Prepare update data
        const updateData = {};

        // Add photoUrls field if it doesn't exist
        if (!reviewData.photoUrls) {
          updateData.photoUrls = [];
        }

        // Add updatedAt field if it doesn't exist
        if (!reviewData.updatedAt) {
          updateData.updatedAt = reviewData.createdAt; // Set to createdAt initially
        }

        // Only update if there are fields to add
        if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, 'reviews', reviewDoc.id), updateData);
          successCount++;
          console.log(`✅ Migrated review: ${reviewDoc.id}`);
        } else {
          console.log(`⏭️  Skipped review (already migrated): ${reviewDoc.id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating review ${reviewDoc.id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total reviews: ${snapshot.size}`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('\n✨ Reviews schema migration completed!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateReviews()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
