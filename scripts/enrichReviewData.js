/**
 * Enrich Review Data with Cafe Names
 *
 * This script:
 * 1. Fetches all reviews from Firestore
 * 2. For each review, looks up the cafe name from the cafes collection
 * 3. Updates the review with cafeName and cafeAddress
 *
 * Run once to populate review data with cafe information.
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Enrich a single review with cafe information
 * @param {Object} review - Review document from Firestore
 * @returns {Promise<boolean>} Success status
 */
async function enrichReview(review) {
  try {
    console.log(`\n📝 Processing review: ${review.id}`);

    // Check if review already has cafeName and coffeeName
    if (review.cafeName && review.coffeeName) {
      console.log(`   ✓ Already has cafe and coffee name, skipping`);
      return true;
    }

    // Fetch cafe data
    if (!review.cafeId) {
      console.log(`   ⚠️  No cafeId, skipping`);
      return false;
    }

    const cafeDoc = await db.collection('cafes').doc(review.cafeId).get();

    if (!cafeDoc.exists) {
      console.log(`   ❌ Cafe not found: ${review.cafeId}`);
      return false;
    }

    const cafeData = cafeDoc.data();

    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add cafeName if missing
    if (!review.cafeName) {
      updateData.cafeName = cafeData.name || '카페';
      console.log(`   ✓ Added cafeName: ${updateData.cafeName}`);
    }

    // Add cafeAddress if missing
    if (!review.cafeAddress) {
      updateData.cafeAddress = cafeData.address || '';
      console.log(`   ✓ Added cafeAddress: ${updateData.cafeAddress}`);
    }

    // Add coffeeName if missing (use a default value for now)
    if (!review.coffeeName) {
      // Try to extract coffee name from comment or use default
      const defaultCoffeeName = review.comment ?
        (review.comment.includes('아메리카노') ? '아메리카노' :
         review.comment.includes('라떼') ? '라떼' :
         review.comment.includes('에스프레소') ? '에스프레소' :
         review.comment.includes('카푸치노') ? '카푸치노' :
         '시그니처 커피') : '시그니처 커피';

      updateData.coffeeName = defaultCoffeeName;
      console.log(`   ✓ Added coffeeName: ${updateData.coffeeName}`);
    }

    // Update Firestore
    await db.collection('reviews').doc(review.id).update(updateData);

    console.log(`   💾 Updated in Firestore`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error enriching review ${review.id}:`, error.message);
    return false;
  }
}

/**
 * Main function: Enrich all reviews
 */
async function enrichAllReviews() {
  try {
    console.log('🚀 Starting review data enrichment...\n');

    // Fetch all reviews
    const reviewsSnapshot = await db.collection('reviews').get();
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 Found ${reviews.length} reviews in Firestore\n`);

    if (reviews.length === 0) {
      console.log('⚠️  No reviews found.');
      process.exit(0);
    }

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    // Process each review
    for (let i = 0; i < reviews.length; i++) {
      const success = await enrichReview(reviews[i]);
      if (success) {
        successCount++;
      } else {
        if (reviews[i].cafeName && reviews[i].coffeeName) {
          skipCount++;
        } else {
          failCount++;
        }
      }

      // Add small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Enrichment Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully enriched: ${successCount} reviews`);
    console.log(`⏭️  Skipped (already complete): ${skipCount} reviews`);
    console.log(`⚠️  Failed or missing cafe: ${failCount} reviews`);
    console.log(`📊 Total processed: ${reviews.length} reviews`);
    console.log('\n💡 Tip: Check Firebase Console to verify the updated data');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
enrichAllReviews();
