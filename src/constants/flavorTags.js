export const FLAVOR_SUGGESTIONS = {
    acidity: {
        high: ['상큼한', '시트러스', '베리', '자두', '라임', '청사과'],
        low: ['부드러운', '구수한']
    },
    body: {
        high: ['묵직한', '크리미', '초콜릿', '버터', '오일리'],
        low: ['가벼운', '깔끔한', '티 같은', '워터리']
    },
    bitterness: {
        high: ['다크초콜릿', '스모키', '카카오', '쌉싸름한'],
        low: []
    },
    sweetness: {
        high: ['달콤한', '카라멜', '꿀', '바닐라', '흑설탕'],
        low: []
    },
    aroma: {
        high: ['꽃향기', '허브', '과일향', '자스민'],
        low: []
    }
};

// All available tags for the general list (combining common ones)
export const ALL_FLAVOR_TAGS = [
    '고소한', '상큼한', '달콤한', '묵직한', '부드러운',
    '꽃향기', '시트러스', '초콜릿', '견과류', '베리',
    '스파이시', '스모키', '허브', '카라멜', '바닐라'
];
