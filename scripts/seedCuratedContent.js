/**
 * BeanLog - Seed Curated Content
 * Districts: Seongsu, Yeonnam, Hannam
 * Strategy: Hyper-Local Data Density + Persona Social Proof
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyA-Y5CQGv2aHRPTEX4Bm4AumnIaiMGiYKU",
    authDomain: "beanlog-app-459cc.firebaseapp.com",
    projectId: "beanlog-app-459cc",
    storageBucket: "beanlog-app-459cc.firebasestorage.app",
    messagingSenderId: "201972315752",
    appId: "1:201972315752:web:6bc5407026381859ef2ddd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Personas ( 부캐 )
const PERSONAS = {
    EDITOR: {
        uid: 'persona_editor_01',
        displayName: '빈로그 에디터 ☕',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    },
    BARISTA: {
        uid: 'persona_barista_kjm',
        displayName: '바리스타 김씨',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    },
    FAIRY: {
        uid: 'persona_fairy',
        displayName: '커피요정 🧚',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
    }
};

const CURATED_CAFES = [
    // 성수 (Seongsu)
    {
        name: '로우키 (lowkey)',
        address: '서울 성동구 연무장3길 6',
        district: '성수',
        isCurated: true,
        locationTags: ['성수', '스페셜티'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop',
        description: '성수동 스페셜티 커피의 성지 중 하나.',
        reviews: [
            {
                persona: PERSONAS.EDITOR,
                coffeeName: '에티오피아 다반차',
                rating: 4.8,
                flavorProfile: { acidity: 5, sweetness: 4, body: 2, bitterness: 1, aroma: 5 },
                tags: ['상큼한', '꽃향기', '시트러스', '베리'],
                comment: '산미의 밸런스가 환상적입니다. 꽃향기가 코끝을 맴도네요.',
                roasting: 'Light'
            }
        ]
    },
    {
        name: '센터커피 성수점',
        address: '서울 성동구 서울숲2길 28-11',
        district: '성수',
        isCurated: true,
        locationTags: ['성수', '서울숲'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop',
        description: '서울숲이 내려다보이는 뷰와 최고의 필터커피.',
        reviews: [
            {
                persona: PERSONAS.BARISTA,
                coffeeName: '게이샤 빌리지',
                rating: 4.5,
                flavorProfile: { acidity: 4, sweetness: 5, body: 3, bitterness: 2, aroma: 5 },
                tags: ['부드러운', '재스민', '우아한'],
                comment: '게이샤 특유의 화사함이 잘 살아있습니다. 서울숲 뷰는 덤이죠.',
                roasting: 'Light'
            }
        ]
    },
    // 연남 (Yeonnam)
    {
        name: '앤트러사이트 연희점',
        address: '서울 서대문구 연희로 15길 48',
        district: '연남',
        isCurated: true,
        locationTags: ['연남', '연희', '드립커피'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=1000&auto=format&fit=crop',
        description: '어두운 분위기 속에서 커피에만 집중할 수 있는 공간.',
        reviews: [
            {
                persona: PERSONAS.EDITOR,
                coffeeName: '파블로 네루다 (Blended)',
                rating: 4.2,
                flavorProfile: { acidity: 2, sweetness: 3, body: 5, bitterness: 4, aroma: 4 },
                tags: ['묵직한', '견과류', '초콜릿'],
                comment: '깊고 묵직한 바디감이 일품입니다. 책 한 권 읽기 딱 좋은 맛이에요.',
                roasting: 'Dark'
            }
        ]
    },
    {
        name: '커피리브레 연남점',
        address: '서울 마포구 성미산로 198',
        district: '연남',
        isCurated: true,
        locationTags: ['연남', '동진시장'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1442116053322-29f818a7a7a0?q=80&w=1000&auto=format&fit=crop',
        description: '리브레의 시작점이자 핸드드립의 강자.',
        reviews: [
            {
                persona: PERSONAS.FAIRY,
                coffeeName: '배드 블러드',
                rating: 4.7,
                flavorProfile: { acidity: 4, sweetness: 4, body: 3, bitterness: 2, aroma: 5 },
                tags: ['상큼한', '달콤한', '과일향'],
                comment: '이름처럼 강렬하지만 깔끔한 뒷맛이 매력적이에요! 🧚',
                roasting: 'Medium'
            }
        ]
    },
    // 한남 (Hannam)
    {
        name: '마일스톤 커피 한남점',
        address: '서울 용산구 한남대로27가길 26',
        district: '한남',
        isCurated: true,
        locationTags: ['한남', '호주커피'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop',
        description: '플랫화이트가 정말 맛있는 호주식 커피 전문점.',
        reviews: [
            {
                persona: PERSONAS.BARISTA,
                coffeeName: '플랫화이트',
                rating: 4.9,
                flavorProfile: { acidity: 2, sweetness: 4, body: 4, bitterness: 2, aroma: 4 },
                tags: ['부드러운', '고소한', '우유 거품'],
                comment: '우유의 단맛과 에스프레소의 조화가 완벽합니다. 플랫화이트 정석.',
                roasting: 'Medium'
            }
        ]
    }
];

async function seed() {
    console.log('🚀 [작전: 하이퍼-로컬] 시드 데이터 추가 시작...');

    const cafesRef = collection(db, 'cafes');
    const reviewsRef = collection(db, 'reviews');

    for (const cafeData of CURATED_CAFES) {
        const { reviews, ...cafe } = cafeData;

        // 1. Add Cafe
        const cafeDoc = await addDoc(cafesRef, {
            ...cafe,
            createdAt: serverTimestamp()
        });
        console.log(`✅ 카페 추가: ${cafe.name} (ID: ${cafeDoc.id})`);

        // 2. Add Associated Reviews (Persona)
        for (const review of reviews) {
            const { persona, ...rData } = review;
            await addDoc(reviewsRef, {
                ...rData,
                cafeId: cafeDoc.id,
                cafeName: cafe.name,
                cafeAddress: cafe.address,
                userId: persona.uid,
                userDisplayName: persona.displayName,
                userPhotoURL: persona.photoURL,
                likes: Math.floor(Math.random() * 20) + 5,
                comments: Math.floor(Math.random() * 5),
                createdAt: serverTimestamp()
            });
            console.log(`   📝 리뷰 추가 (${persona.displayName}): ${rData.coffeeName}`);
        }
    }

    console.log('\n🎉 하이퍼-로컬 시드 완료! 성수/연남/한남 지역의 해자가 구축되었습니다.');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ 시드 실패:', err);
    process.exit(1);
});
