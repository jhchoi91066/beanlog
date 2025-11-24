// Script to seed Explore tab data to Firebase
// Run: node scripts/seedExploreData.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Trending Cafes Data
const TRENDING_CAFES = [
  {
    name: "테라로사",
    location: "강릉",
    address: "강원도 강릉시 구정면 현천길 7",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    trend: "+24%",
    trendValue: 24,
    rating: 4.7,
    reviewCount: 342,
    categories: ["스페셜티", "로스팅", "원두구매"],
    description: "강릉을 대표하는 스페셜티 커피 로스터리 카페",
    latitude: 37.8228,
    longitude: 128.8558,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "모모스커피",
    location: "부산",
    address: "부산광역시 수영구 광안해변로 293",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
    trend: "+18%",
    trendValue: 18,
    rating: 4.6,
    reviewCount: 256,
    categories: ["스페셜티", "핸드드립", "디저트맛집"],
    description: "광안리 바다를 바라보며 즐기는 스페셜티 커피",
    latitude: 35.1532,
    longitude: 129.1189,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: "프릳츠",
    location: "서울",
    address: "서울특별시 종로구 북촌로5가길 19",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400",
    trend: "+15%",
    trendValue: 15,
    rating: 4.8,
    reviewCount: 428,
    categories: ["스페셜티", "에스프레소바", "디저트맛집"],
    description: "북촌의 감성을 담은 프리미엄 커피 전문점",
    latitude: 37.5814,
    longitude: 126.9849,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Curated Collections Data
const CURATED_COLLECTIONS = [
  {
    title: "성수동 커피 투어",
    subtitle: "공장지대에서 피어난 커피향",
    image: "https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    cafeCount: 12,
    description: "과거 공장지대였던 성수동은 이제 서울의 핫플레이스로 자리잡았습니다. 독특한 인테리어와 훌륭한 커피를 자랑하는 카페들을 만나보세요.",
    area: "성수동",
    isEditorPick: true,
    views: 1524,
    likes: 243,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "비 오는 날, 따뜻한 라떼",
    subtitle: "감성 충전이 필요할 때",
    image: "https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cafeCount: 8,
    description: "빗소리를 들으며 마시는 따뜻한 라떼 한 잔. 감성적인 분위기의 카페를 모았습니다.",
    theme: "감성",
    isEditorPick: true,
    views: 892,
    likes: 156,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: "스페셜티 입문하기",
    subtitle: "커피의 신세계로 초대합니다",
    image: "https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    cafeCount: 15,
    description: "스페셜티 커피의 세계에 첫 발을 내딛는 분들을 위한 큐레이션입니다.",
    theme: "스페셜티",
    isEditorPick: true,
    views: 2134,
    likes: 387,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// Categories Data
const CATEGORIES = [
  { name: "스페셜티", cafeCount: 156, icon: "cafe" },
  { name: "디카페인", cafeCount: 45, icon: "moon" },
  { name: "핸드드립", cafeCount: 89, icon: "water" },
  { name: "에스프레소바", cafeCount: 124, icon: "flash" },
  { name: "디저트맛집", cafeCount: 203, icon: "ice-cream" },
  { name: "대형카페", cafeCount: 67, icon: "home" },
  { name: "로스팅", cafeCount: 34, icon: "flame" },
  { name: "원두구매", cafeCount: 52, icon: "bag" },
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed Explore data...');

    // Seed Trending Cafes
    console.log('\n📍 Seeding trending cafes...');
    for (const cafe of TRENDING_CAFES) {
      const docRef = await db.collection('trendingCafes').add(cafe);
      console.log(`✅ Added trending cafe: ${cafe.name} (${docRef.id})`);
    }

    // Seed Curated Collections
    console.log('\n✨ Seeding curated collections...');
    for (const collection of CURATED_COLLECTIONS) {
      const docRef = await db.collection('collections').add(collection);
      console.log(`✅ Added collection: ${collection.title} (${docRef.id})`);
    }

    // Seed Categories
    console.log('\n🏷️  Seeding categories...');
    for (const category of CATEGORIES) {
      const docRef = await db.collection('categories').add({
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Added category: ${category.name} (${docRef.id})`);
    }

    console.log('\n✨ Successfully seeded all Explore data!');
    console.log('\n📊 Summary:');
    console.log(`   - Trending Cafes: ${TRENDING_CAFES.length}`);
    console.log(`   - Collections: ${CURATED_COLLECTIONS.length}`);
    console.log(`   - Categories: ${CATEGORIES.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Run the seed function
seedData();
