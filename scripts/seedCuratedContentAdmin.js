/**
 * BeanLog - Seed Curated Content (Admin Version)
 * USES FIREBASE ADMIN SDK to bypass security rules.
 */

const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));

// Initialize if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Personas
const PERSONAS = {
    EDITOR: {
        uid: 'persona_editor_01',
        displayName: '빈로그 에디터 ☕',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
    BARISTA: {
        uid: 'persona_barista_kjm',
        displayName: '바리스타 김씨',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
    FAIRY: {
        uid: 'persona_fairy',
        displayName: '커피요정 🧚',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    }
};

// Image Pool (High Quality Coffee/Cafe interiors)
const IMAGES = [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000',
    'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=1000',
    'https://images.unsplash.com/photo-1442116053322-29f818a7a7a0?q=80&w=1000',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000',
    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000',
    'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1000',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1000',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000'
];

const getRandomImage = () => IMAGES[Math.floor(Math.random() * IMAGES.length)];
const getRandomPersona = () => Object.values(PERSONAS)[Math.floor(Math.random() * 3)];
const getRandomRating = (min = 4.0, max = 5.0) => Number((Math.random() * (max - min) + min).toFixed(1));

// Real Cafe Data (Seongsu, Yeonnam, Hannam)
// Note: Addresses are approximated to the district level for bulk entry if exact address is variable.
// Ideally, these would be precise.
const CAFE_LIST = [
    // --- SEONGSU (30) ---
    { name: '로우키 (lowkey)', district: '성수', address: '서울 성동구 연무장3길 6', tags: ['스페셜티', '드립커피', '분위기'] },
    { name: '센터커피 성수점', district: '성수', address: '서울 성동구 서울숲2길 28-11', tags: ['서울숲', '뷰맛집', '게이샤'] },
    { name: '메쉬커피 (Mesh Coffee)', district: '성수', address: '서울 성동구 서울숲길 43', tags: ['라떼맛집', '힙한', '스탠딩'] },
    { name: '커피냅로스터스 성수', district: '성수', address: '서울 성동구 성수동2가 322-20', tags: ['벽돌감성', '로스터리'] },
    { name: '마일스톤 커피 성수', district: '성수', address: '서울 성동구 서울숲4길 15', tags: ['비엔나', '디저트', '호주식'] },
    { name: '피어커피 성수', district: '성수', address: '서울 성동구 성수일로4길 25', tags: ['블루리본', '브루잉'] },
    { name: '대림창고', district: '성수', address: '서울 성동구 성수이로 78', tags: ['대형카페', '갤러리'] },
    { name: '어니언 성수 (Onion)', district: '성수', address: '서울 성동구 아차산로9길 8', tags: ['베이커리', '루프탑', '인더스트리얼'] },
    { name: '카멜커피 (Camel)', district: '성수', address: '서울 성동구 성덕정19길 6', tags: ['크림커피', '웨이팅'] },
    { name: '블루보틀 성수', district: '성수', address: '서울 성동구 아차산로 7', tags: ['뉴올리언스', '라떼'] },
    { name: '모리티아', district: '성수', address: '서울 성동구 뚝섬로 317', tags: ['핑크', '포토존'] },
    { name: '브루잉 세레모니', district: '성수', address: '서울 성동구 연무장길 33', tags: ['블랙', '핸드드립'] },
    { name: '리커버리커피바', district: '성수', address: '서울 성동구 왕십리로 115', tags: ['조용한', '힐링'] },
    { name: '할아버지공장', district: '성수', address: '서울 성동구 성수이로7가길 9', tags: ['오두막', '대형카페'] },
    { name: '쎈느 (Scene)', district: '성수', address: '서울 성동구 연무장5길 20', tags: ['패션', '복합문화공간'] },
    { name: '텅 성수 (Tongue)', district: '성수', address: '서울 성동구 성수이로 82', tags: ['유니크', '아트'] },
    { name: '로우커피스탠드', district: '성수', address: '서울 성동구 왕십리로4길 28-2', tags: ['가성비', '테이크아웃'] },
    { name: '프롤라', district: '성수', address: '서울 성동구 연무장17길 5', tags: ['에스프레소바', '이탈리안'] },
    { name: '비비비 (BBB)', district: '성수', address: '서울 성동구 성수이로 82', tags: ['베이글', '브런치'] },
    { name: '하루노유키', district: '성수', address: '서울 성동구 서울숲2길 17', tags: ['바움쿠헨', '일본디저트'] },
    { name: '이페메라', district: '성수', address: '서울 성동구 연무장길 14', tags: ['LCDC', '타르트'] },
    { name: '업사이드커피 뚝섬', district: '성수', address: '서울 성동구 왕십리로14길 8', tags: ['해방촌', '미어캣'] },
    { name: '슈퍼말차 성수', district: '성수', address: '서울 성동구 서울숲6길 19', tags: ['말차', '건강'] },
    { name: '치즈인더스트리', district: '성수', address: '서울 성동구 성수이로18길 37', tags: ['치즈케이크', '컨셉'] },
    { name: '레인리포트 크루아상', district: '성수', address: '서울 성동구 성수이로16길 32', tags: ['비내리는', '크루아상'] },
    { name: '자연도소금빵', district: '성수', address: '서울 성동구 연무장길 56-1', tags: ['소금빵', '웨이팅'] },
    { name: '오우드 (Oude)', district: '성수', address: '서울 성동구 연무장길 101-1', tags: ['베이커리', '햇살맛집'] },
    { name: '누데이크 성수', district: '성수', address: '서울 성동구 성수이로7길 26', tags: ['예술', '피크'] },
    { name: '카페 포제', district: '성수', address: '서울 성동구 연무장길 110', tags: ['힙합', '전시'] },
    { name: '코사이어티', district: '성수', address: '서울 성동구 왕십리로 82-20', tags: ['코워킹', '갤러리'] },

    // --- YEONNAM (30) ---
    { name: '테일러커피 연남', district: '연남', address: '서울 마포구 성미산로 189', tags: ['아인슈페너', '모던'] },
    { name: '앤트러사이트 연희', district: '연남', address: '서울 서대문구 연희로 15길 48', tags: ['다크', '작업하기좋은'] },
    { name: '커피리브레 연남', district: '연남', address: '서울 마포구 성미산로 198', tags: ['스페셜티', '복면'] },
    { name: '오츠커피 (Oats)', district: '연남', address: '서울 마포구 독막로 14길 32', tags: ['아인슈페너', '우드'] },
    { name: '커피냅로스터스 연남', district: '연남', address: '서울 마포구 성미산로 27길 70', tags: ['언덕', '인테리어'] },
    { name: '카페 레이어드', district: '연남', address: '서울 마포구 성미산로 161-4', tags: ['스콘', '유럽감성'] },
    { name: '얼스어스', district: '연남', address: '서울 마포구 성미산로 150', tags: ['친환경', '케이크'] },
    { name: '작당모의', district: '연남', address: '서울 마포구 동교로 32길 19', tags: ['디저트', '비주얼'] },
    { name: '파롤앤랑그', district: '연남', address: '서울 마포구 성미산로 29안길 8', tags: ['파이', '웨이팅'] },
    { name: '하이웨스트', district: '연남', address: '서울 마포구 성미산로 167-22', tags: ['빈티지', '스콘'] },
    { name: '콩카페 연남', district: '연남', address: '서울 마포구 성미산로 161-14', tags: ['코코넛', '베트남'] },
    { name: '툭툭누들타이 (근처 카페)', district: '연남', address: '서울 마포구 연희로 15길 48', tags: ['태국', '미쉐린'] }, // Cafe reference kept for location context
    { name: '카페 스콘', district: '연남', address: '서울 마포구 성미산로 172', tags: ['루프탑', '귀여운'] },
    { name: '딩가케이크', district: '연남', address: '서울 마포구 동교로 29길 68', tags: ['케이크', '미국레트로'] },
    { name: '연남동 벚꽃집', district: '연남', address: '서울 마포구 동교로 29길 50', tags: ['벚꽃', '주택개조'] },
    { name: '스탬프커피', district: '연남', address: '서울 마포구 성미산로 161-7', tags: ['머랭', '디저트'] },
    { name: '브라운하우스', district: '연남', address: '서울 마포구 동교로 50길 25', tags: ['가구', '인테리어'] },
    { name: '맥코이 연남', district: '연남', address: '서울 마포구 성미산로 147', tags: ['오두막', '에스프레소'] },
    { name: '청수당 공명', district: '연남', address: '서울 마포구 성미산로 152', tags: ['물', '정원'] },
    { name: '미라보양과자점', district: '연남', address: '서울 마포구 성미산로 152', tags: ['마카롱', '클래식'] }, // Address corrected
    { name: '이미 (imi)', district: '연남', address: '서울 마포구 동교로 25길 7', tags: ['오렌지빙수', '블루리본'] },
    { name: '호라이즌 16', district: '연남', address: '서울 마포구 성미산로 29길 26', tags: ['파운드', '케이크'] },
    { name: '듀윗', district: '연남', address: '서울 마포구 동교로 242', tags: ['프랑스', '디저트'] },
    { name: '모멘트커피', district: '연남', address: '서울 마포구 월드컵북로 4길 29', tags: ['일본감성', '야끼빵'] },
    { name: '사이드테이블', district: '연남', address: '서울 마포구 성미산로 198', tags: ['조용한', '공부'] },
    { name: '피프 에스프레소바', district: '연남', address: '서울 마포구 성미산로 29길 32', tags: ['크로플', '테라스'] },
    { name: '땡스오트', district: '연남', address: '서울 마포구 성미산로 23길 68', tags: ['요거트', '그래놀라'] },
    { name: '마가렛', district: '연남', address: '서울 마포구 성미산로 29길 10', tags: ['큐브파이', '주택'] },
    { name: '낙랑파라', district: '연남', address: '서울 마포구 연희로1길 21', tags: ['빈티지', '엔틱'] },
    { name: '산 포터리', district: '연남', address: '서울 마포구 성미산로 29길 30', tags: ['도자기', '체험'] },

    // --- HANNAM (30) ---
    { name: '마일스톤 한남', district: '한남', address: '서울 용산구 한남대로27가길 26', tags: ['플랫화이트', '티라미수'] },
    { name: '앤트러사이트 한남', district: '한남', address: '서울 용산구 이태원로 240', tags: ['인더스트리얼', '로스터리'] },
    { name: '맥심플랜트', district: '한남', address: '서울 용산구 이태원로 250', tags: ['대형카페', '스타벅스리저브급'] },
    { name: '패션5', district: '한남', address: '서울 용산구 이태원로 272', tags: ['베이커리', '럭셔리'] },
    { name: '올드페리도넛', district: '한남', address: '서울 용산구 한남대로27길 66', tags: ['도넛', '튜브'] },
    { name: '33apartment', district: '한남', address: '서울 용산구 한남대로27길 33', tags: ['에스프레소', '스콘'] },
    { name: 'mtl 한남', district: '한남', address: '서울 용산구 이태원로49길 24', tags: ['보난자커피', '편집샵'] },
    { name: '로우커피 한남', district: '한남', address: '서울 용산구 이태원로54길 26', tags: ['밀크티', '화이트'] },
    { name: '사운즈한남 (콰르텟)', district: '한남', address: '서울 용산구 대사관로 35', tags: ['복합문화', '테라스'] },
    { name: '아러바우트', district: '한남', address: '서울 용산구 대사관로31길 7-6', tags: ['빈티지', '폐공장'] },
    { name: '콘하스 한남', district: '한남', address: '서울 용산구 이태원로55나길 22', tags: ['수영장', '주택개조'] },
    { name: '원인어밀리언', district: '한남', address: '서울 용산구 이태원로54길 31', tags: ['분홍', '포토존'] },
    { name: '데이로우', district: '한남', address: '서울 용산구 이태원로49길 14-3', tags: ['아늑한', '호주식'] },
    { name: '크레이트커피', district: '한남', address: '서울 용산구 독서당로 97', tags: ['모던', '작업하기좋은'] },
    { name: '웻커피 한남', district: '한남', address: '서울 용산구 한남대로27가길 10', tags: ['도넛', '지하'] },
    { name: '오아시스 한남', district: '한남', address: '서울 용산구 도산대로55길 20', tags: ['브런치', '청담'] }, // Address check needed, usually Hannam branch exists
    { name: '타르틴베이커리 한남', district: '한남', address: '서울 용산구 한남대로18길 22', tags: ['사워도우', '미국'] },
    { name: '라라브레드 한남', district: '한남', address: '서울 용산구 대사관로30길 8', tags: ['식빵', '파스타'] },
    { name: '호프가든 한남', district: '한남', address: '서울 용산구 이태원로54길 58', tags: ['정원', '케이크'] },
    { name: '맥코이 한남', district: '한남', address: '서울 용산구 한남대로27길 34', tags: ['엔틱', '크림라떼'] },
    { name: '파이프그라운드', district: '한남', address: '서울 용산구 한남대로27길 66', tags: ['옥수수피자', '맛집'] }, // Included as it's often a coffee destination too
    { name: '다운타우너 한남', district: '한남', address: '서울 용산구 대사관로5길 12', tags: ['버거', '힙한'] },
    { name: '노티드 한남', district: '한남', address: '서울 용산구 대사관로5길 12', tags: ['도넛', '귀여운'] },
    { name: '블루보틀 한남', district: '한남', address: '서울 용산구 한남대로 91', tags: ['파란병', '지수'] },
    { name: '스타벅스 한남R', district: '한남', address: '서울 용산구 독서당로 94', tags: ['리저브', '프리미엄'] },
    { name: '폴바셋 한남', district: '한남', address: '서울 용산구 한남대로 48', tags: ['아이스크림', '라떼'] },
    { name: '한남베르그', district: '한남', address: '서울 용산구 이태원로54길 58-26', tags: ['크로플', '테라스'] },
    { name: '네로우패스', district: '한남', address: '서울 용산구 이태원로42길 38', tags: ['파이', '감성'] },
    { name: '마크원', district: '한남', address: '서울 용산구 장문로 23', tags: ['갤러리', '고급'] },
    { name: '탄산바', district: '한남', address: '서울 용산구 이태원로49길 24-12', tags: ['하이볼', '바'] }, // Sometimes opens as cafe
];

// Helper to generate flavor profile
const getFlavorProfile = (type = 'balanced') => {
    switch (type) {
        case 'fruity': return { acidity: 5, sweetness: 4, body: 2, bitterness: 1, aroma: 5 };
        case 'nutty': return { acidity: 2, sweetness: 3, body: 5, bitterness: 4, aroma: 4 };
        case 'sweet': return { acidity: 3, sweetness: 5, body: 3, bitterness: 2, aroma: 4 };
        default: return { acidity: 3, sweetness: 3, body: 3, bitterness: 3, aroma: 3 };
    }
};

const COMMENTS = [
    "분위기가 너무 좋아요! 커피도 맛있습니다.",
    "친구랑 수다떨기 좋은 곳. 디저트 추천!",
    "작업하기 좋은 조용한 카페입니다.",
    "커피 맛이 정말 훌륭해요. 원두 설명도 친절했습니다.",
    "인테리어가 감각적이에요. 사진 찍기 좋습니다.",
    "주말엔 사람이 많지만 평일엔 여유로워요.",
    "시그니처 메뉴가 독특하고 맛있네요.",
    "재방문 의사 있습니다! 🥰",
    "라떼가 고소하고 진해요.",
    "스콘 맛집 인정입니다."
];

async function seed() {
    console.log(`🚀 [작전: 하이퍼-로컬] ${CAFE_LIST.length}개 카페 시드 시작...`);

    const cafesRef = db.collection('cafes');
    const reviewsRef = db.collection('reviews');

    for (const cafeData of CAFE_LIST) {
        // 1. Add Cafe
        const cafeDoc = await cafesRef.add({
            name: cafeData.name,
            address: cafeData.address,
            district: cafeData.district,
            locationTags: [cafeData.district, ...cafeData.tags],
            isCurated: true,
            thumbnailUrl: getRandomImage(),
            description: `${cafeData.district}의 핫플레이스, ${cafeData.name}.`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ 카페 추가: ${cafeData.name}`);

        // 2. Add 1-2 Reviews per cafe
        const reviewCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < reviewCount; i++) {
            const persona = getRandomPersona();
            const rating = getRandomRating();
            const flavorType = ['fruity', 'nutty', 'sweet', 'balanced'][Math.floor(Math.random() * 4)];
            const flavorProfile = getFlavorProfile(flavorType);

            await reviewsRef.add({
                cafeId: cafeDoc.id,
                cafeName: cafeData.name,
                cafeAddress: cafeData.address,
                userId: persona.uid,
                userDisplayName: persona.displayName,
                userPhotoURL: persona.photoURL,
                rating: rating,
                coffeeName: '시그니처 커피',
                flavorProfile: flavorProfile,
                tags: cafeData.tags,
                basicTags: cafeData.tags, // For compatibility
                comment: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
                likes: Math.floor(Math.random() * 20),
                comments: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    console.log('\n🎉 하이퍼-로컬 시드 완료!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ 시드 실패:', err);
    process.exit(1);
});
