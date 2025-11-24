// Script to delete Explore tab sample data from Firebase
// Run: node scripts/deleteExploreData.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log(`   ℹ️  No documents found in ${collectionName}`);
    return 0;
  }

  const batchSize = snapshot.size;
  let deletedCount = 0;

  // Delete documents in batches
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    deletedCount++;
  });

  await batch.commit();
  return deletedCount;
}

async function deleteData() {
  try {
    console.log('🗑️  Starting to delete Explore sample data...\n');

    // Delete Trending Cafes
    console.log('📍 Deleting trending cafes...');
    const trendingCount = await deleteCollection('trendingCafes');
    console.log(`   ✅ Deleted ${trendingCount} trending cafes\n`);

    // Delete Collections
    console.log('✨ Deleting curated collections...');
    const collectionsCount = await deleteCollection('collections');
    console.log(`   ✅ Deleted ${collectionsCount} collections\n`);

    // Delete Categories
    console.log('🏷️  Deleting categories...');
    const categoriesCount = await deleteCollection('categories');
    console.log(`   ✅ Deleted ${categoriesCount} categories\n`);

    console.log('✨ Successfully deleted all Explore sample data!');
    console.log('\n📊 Summary:');
    console.log(`   - Trending Cafes deleted: ${trendingCount}`);
    console.log(`   - Collections deleted: ${collectionsCount}`);
    console.log(`   - Categories deleted: ${categoriesCount}`);

  } catch (error) {
    console.error('❌ Error deleting data:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Confirm before deleting
console.log('⚠️  WARNING: This will delete all sample data from Explore tab collections.');
console.log('   Collections to be deleted:');
console.log('   - trendingCafes');
console.log('   - collections');
console.log('   - categories\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  readline.close();

  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    deleteData();
  } else {
    console.log('❌ Deletion cancelled.');
    process.exit();
  }
});
