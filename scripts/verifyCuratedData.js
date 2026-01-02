/**
 * BeanLog - Verify Curated Data
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function verify() {
    console.log('🔍 데이터 정합성 확인 중...');

    // 1. Curated Cafes
    const curatedCafes = await db.collection('cafes').where('isCurated', '==', true).get();
    console.log(`✅ 큐레이션 카페 수: ${curatedCafes.size}`);
    curatedCafes.forEach(doc => {
        console.log(`   - ${doc.data().name} (${doc.data().district})`);
    });

    // 2. Persona Reviews
    const personaReviews = await db.collection('reviews').where('userId', '>=', 'persona').where('userId', '<=', 'persona\uf8ff').get();
    console.log(`✅ 페르소나 리뷰 수: ${personaReviews.size}`);
    personaReviews.forEach(doc => {
        console.log(`   - [${doc.data().userDisplayName}] ${doc.data().cafeName}: ${doc.data().coffeeName}`);
    });

    process.exit(0);
}

verify().catch(err => {
    console.error('❌ 확인 실패:', err);
    process.exit(1);
});
