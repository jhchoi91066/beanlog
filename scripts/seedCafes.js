// Firestore 카페 데이터 시드 스크립트
// 문서 참조: The Execution - 초기 콘텐츠 100개 확보

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase 설정 (src/services/firebase.js와 동일한 설정 사용)
const firebaseConfig = {
  apiKey: "AIzaSyA-Y5CQGv2aHRPTEX4Bm4AumnIaiMGiYKU",
  authDomain: "beanlog-app-459cc.firebaseapp.com",
  projectId: "beanlog-app-459cc",
  storageBucket: "beanlog-app-459cc.firebasestorage.app",
  messagingSenderId: "201972315752",
  appId: "1:201972315752:web:6bc5407026381859ef2ddd",
  measurementId: "G-5LXXL44NKV"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 초기 카페 데이터 (30곳)
const cafes = [
  // 성수 (5곳)
  {
    name: '블루보틀 성수',
    address: '서울 성동구 아차산로 49길 7',
    locationTags: ['서울', '성수'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Blue+Bottle'
  },
  {
    name: '테라로사 성수',
    address: '서울 성동구 성수이로 7길 15',
    locationTags: ['서울', '성수'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Terarosa'
  },
  {
    name: '커피리브레 성수',
    address: '서울 성동구 연무장길 9',
    locationTags: ['서울', '성수'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Coffee+Libre'
  },
  {
    name: '아우어베이커리',
    address: '서울 성동구 연무장5길 11',
    locationTags: ['서울', '성수'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Aour+Bakery'
  },
  {
    name: '대림창고',
    address: '서울 성동구 성수이로10길 32',
    locationTags: ['서울', '성수'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Daelim+Warehouse'
  },

  // 연남/망원 (5곳)
  {
    name: '연남방앗간',
    address: '서울 마포구 동교로46길 52',
    locationTags: ['서울', '연남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Yeonnam+Mill'
  },
  {
    name: '카페온리',
    address: '서울 마포구 동교로38길 9',
    locationTags: ['서울', '연남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Cafe+Onion'
  },
  {
    name: '소울커피 연남',
    address: '서울 마포구 동교로 200',
    locationTags: ['서울', '연남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Soul+Coffee'
  },
  {
    name: '망원동티라미수',
    address: '서울 마포구 월드컵로15길 29',
    locationTags: ['서울', '망원'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Tiramisu'
  },
  {
    name: '카페보나',
    address: '서울 마포구 포은로6길 27',
    locationTags: ['서울', '망원'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Cafe+Bona'
  },

  // 강남 (5곳)
  {
    name: '프릳츠 강남',
    address: '서울 강남구 테헤란로 152',
    locationTags: ['서울', '강남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Fritz'
  },
  {
    name: '커피빈 강남점',
    address: '서울 강남구 테헤란로 427',
    locationTags: ['서울', '강남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Coffee+Bean'
  },
  {
    name: '스타벅스 리저브 강남',
    address: '서울 강남구 테헤란로 419',
    locationTags: ['서울', '강남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Starbucks+Reserve'
  },
  {
    name: '디저트39 강남',
    address: '서울 강남구 봉은사로 417',
    locationTags: ['서울', '강남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Dessert39'
  },
  {
    name: '앤트러사이트 강남',
    address: '서울 강남구 강남대로 640',
    locationTags: ['서울', '강남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Anthracite'
  },

  // 홍대 (5곳)
  {
    name: '앤트러사이트 홍대',
    address: '서울 마포구 양화로 188',
    locationTags: ['서울', '홍대'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Anthracite+Hongdae'
  },
  {
    name: '카페무이',
    address: '서울 마포구 어울마당로 120',
    locationTags: ['서울', '홍대'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Cafe+Mui'
  },
  {
    name: '커피한약방',
    address: '서울 마포구 양화로6길 57-16',
    locationTags: ['서울', '홍대'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Coffee+Hanyakbang'
  },
  {
    name: '폴바셋 홍대',
    address: '서울 마포구 양화로 160',
    locationTags: ['서울', '홍대'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Paul+Bassett'
  },
  {
    name: '투썸플레이스 홍대',
    address: '서울 마포구 양화로 153',
    locationTags: ['서울', '홍대'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=A+Twosome+Place'
  },

  // 종로/광화문 (5곳)
  {
    name: '커피명가 종로',
    address: '서울 종로구 종로 19',
    locationTags: ['서울', '종로'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Coffee+Myungga'
  },
  {
    name: '할리스 광화문',
    address: '서울 종로구 세종대로 149',
    locationTags: ['서울', '광화문'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Hollys'
  },
  {
    name: '카페베네 광화문',
    address: '서울 종로구 새문안로 68',
    locationTags: ['서울', '광화문'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Caffe+Bene'
  },
  {
    name: '엔제리너스 종로',
    address: '서울 종로구 종로 51',
    locationTags: ['서울', '종로'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Angel-in-us'
  },
  {
    name: '커피스미스 광화문',
    address: '서울 종로구 세종대로 211',
    locationTags: ['서울', '광화문'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Coffee+Smith'
  },

  // 을지로/기타 (5곳)
  {
    name: '을지커피',
    address: '서울 중구 을지로 175',
    locationTags: ['서울', '을지로'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Euljiro+Coffee'
  },
  {
    name: '카페마마스',
    address: '서울 중구 을지로3길 21',
    locationTags: ['서울', '을지로'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Cafe+Mamas'
  },
  {
    name: '낙원상가 다방',
    address: '서울 종로구 삼일대로 428',
    locationTags: ['서울', '종로'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Nakwon+Dabang'
  },
  {
    name: '이태원 블루스퀘어',
    address: '서울 용산구 이태원로 294',
    locationTags: ['서울', '이태원'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Blue+Square'
  },
  {
    name: '한남동 카페',
    address: '서울 용산구 한남대로 42길 14',
    locationTags: ['서울', '한남'],
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Hannam+Cafe'
  },
];

// 카페 데이터 추가 함수
async function seedCafes() {
  console.log('🚀 카페 데이터 추가 시작...');

  try {
    const cafesRef = collection(db, 'cafes');

    for (let i = 0; i < cafes.length; i++) {
      const cafe = cafes[i];
      const docRef = await addDoc(cafesRef, cafe);
      console.log(`✅ [${i + 1}/${cafes.length}] ${cafe.name} 추가 완료 (ID: ${docRef.id})`);
    }

    console.log('\n🎉 모든 카페 데이터 추가 완료!');
    console.log(`총 ${cafes.length}개의 카페가 추가되었습니다.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedCafes();
