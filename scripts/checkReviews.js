const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA-Y5CQGv2aHRPTEX4Bm4AumnIaiMGiYKU",
  authDomain: "beanlog-app-459cc.firebaseapp.com",
  projectId: "beanlog-app-459cc",
  storageBucket: "beanlog-app-459cc.firebasestorage.app",
  messagingSenderId: "201972315752",
  appId: "1:201972315752:web:6bc5407026381859ef2ddd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkReviews() {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);

    console.log(`\n📊 현재 Firestore 리뷰 수: ${snapshot.size}개`);
    console.log(`📋 목표: 100개`);
    console.log(`⚡ 남은 리뷰: ${Math.max(0, 100 - snapshot.size)}개\n`);

    if (snapshot.size > 0) {
      console.log('리뷰 샘플 (최근 3개):');
      snapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. 카페ID: ${data.cafeId}, 평점: ${data.rating}점, 태그: ${data.basicTags?.join(', ') || '없음'}`);
      });
    } else {
      console.log('⚠️  아직 작성된 리뷰가 없습니다.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkReviews();
