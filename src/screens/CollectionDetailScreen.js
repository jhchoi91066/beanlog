// BeanLog - Collection Detail Screen
// Ported from BeanLog2/src/components/explore/Explore.tsx (CollectionDetailView)

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const { width } = Dimensions.get('window');

const CollectionDetailScreen = ({ navigation, route }) => {
    const { collection } = route.params;

    // Mock Cafes for Collection
    const cafes = [
        {
            id: "1",
            name: "테라로사 커피",
            location: "서울 성수동",
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
            rating: 4.8,
            reviews: 328,
            distance: "1.2km",
            tags: ["스페셜티", "로스터리", "브런치"],
        },
        {
            id: "2",
            name: "커피리브레",
            location: "서울 성수동",
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
            rating: 4.7,
            reviews: 256,
            distance: "0.8km",
            tags: ["핸드드립", "조용한", "디저트"],
        },
        {
            id: "3",
            name: "대림창고",
            location: "서울 성수동",
            image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
            rating: 4.9,
            reviews: 412,
            distance: "1.5km",
            tags: ["넓은", "뷰맛집", "브런치"],
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Image Section */}
                <View style={styles.heroContainer}>
                    <Image source={{ uri: collection.image }} style={styles.heroImage} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
                        style={styles.heroGradientTop}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                        style={styles.heroGradientBottom}
                    >
                        <View style={styles.heroContent}>
                            <View style={styles.badge}>
                                <Ionicons name="ribbon" size={12} color="#FFFFFF" />
                                <Text style={styles.badgeText}>Editor's Pick</Text>
                            </View>
                            <Text style={styles.heroTitle}>{collection.title}</Text>
                            <Text style={styles.heroSubtitle}>{collection.subtitle}</Text>
                            <View style={styles.heroMeta}>
                                <View style={styles.heroMetaItem}>
                                    <Ionicons name="cafe" size={14} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.heroMetaText}>{cafes.length}개 카페</Text>
                                </View>
                                <View style={styles.heroMetaItem}>
                                    <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.heroMetaText}>1.2k명 저장</Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Back Button */}
                    <SafeAreaView style={styles.backButtonSafeArea}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <Text style={styles.description}>
                        {collection.description ||
                            "과거 공장지대였던 성수동은 이제 서울의 핫플레이스로 자리잡았습니다. 독특한 인테리어와 훌륭한 커피를 자랑하는 카페들을 만나보세요."}
                    </Text>

                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>추천 카페</Text>
                        <TouchableOpacity style={styles.mapButton}>
                            <Ionicons name="map-outline" size={16} color={Colors.stone800} />
                            <Text style={styles.mapButtonText}>지도로 보기</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.cafeList}>
                        {cafes.map((cafe) => (
                            <TouchableOpacity
                                key={cafe.id}
                                style={styles.cafeCard}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('CafeDetail', { cafeId: cafe.id })}
                            >
                                <View style={styles.cafeCardContent}>
                                    <Image source={{ uri: cafe.image }} style={styles.cafeImage} />
                                    <View style={styles.cafeInfo}>
                                        <View style={styles.cafeHeader}>
                                            <View style={styles.cafeTitleRow}>
                                                <Text style={styles.cafeName}>{cafe.name}</Text>
                                                <View style={styles.cafeLocationRow}>
                                                    <Ionicons name="location-sharp" size={12} color={Colors.stone400} />
                                                    <Text style={styles.cafeLocation}>{cafe.location}</Text>
                                                    <Text style={styles.dotSeparator}>·</Text>
                                                    <Text style={styles.cafeDistance}>{cafe.distance}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity>
                                                <Ionicons name="heart-outline" size={20} color={Colors.stone400} />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={14} color={Colors.amber400} />
                                            <Text style={styles.ratingText}>{cafe.rating}</Text>
                                            <Text style={styles.reviewText}>({cafe.reviews})</Text>
                                        </View>

                                        <View style={styles.tagsRow}>
                                            {cafe.tags.map((tag, index) => (
                                                <View key={index} style={styles.tag}>
                                                    <Text style={styles.tagText}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },

    // Hero Section
    heroContainer: {
        height: 300,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    heroGradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: 'flex-end',
        padding: 24,
    },
    backButtonSafeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    backButton: {
        padding: 16,
        marginLeft: 8,
    },
    heroContent: {
        gap: 8,
    },
    badge: {
        backgroundColor: Colors.amber500,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
        marginBottom: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    heroTitle: {
        fontSize: Typography.h1.fontSize,
        fontWeight: Typography.h1.fontWeight,
        color: '#FFFFFF',
    },
    heroSubtitle: {
        fontSize: Typography.body.fontSize,
        color: Colors.stone200,
    },
    heroMeta: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    heroMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    heroMetaText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: Typography.caption.fontSize,
    },

    // Content Section
    contentContainer: {
        padding: 24,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    description: {
        fontSize: Typography.body.fontSize,
        color: Colors.stone600,
        lineHeight: 24,
        marginBottom: 32,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listTitle: {
        fontSize: Typography.h3.fontSize,
        fontWeight: Typography.h3.fontWeight,
        color: Colors.stone800,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.stone200,
        backgroundColor: Colors.backgroundWhite,
    },
    mapButtonText: {
        fontSize: Typography.captionSmall.fontSize,
        fontWeight: Typography.buttonSmall.fontWeight,
        color: Colors.stone800,
    },

    // Cafe List
    cafeList: {
        gap: 16,
    },
    cafeCard: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        overflow: 'hidden',
        // Shadow
        ...Platform.select({
            ios: {
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cafeCardContent: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    cafeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: Colors.stone200,
    },
    cafeInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cafeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cafeTitleRow: {
        flex: 1,
        marginRight: 8,
    },
    cafeName: {
        fontSize: Typography.h4.fontSize,
        fontWeight: Typography.h4.fontWeight,
        color: Colors.stone800,
        marginBottom: 4,
    },
    cafeLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    cafeLocation: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone500,
    },
    dotSeparator: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone300,
    },
    cafeDistance: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone500,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    ratingText: {
        fontSize: Typography.caption.fontSize,
        fontWeight: 'bold',
        color: Colors.stone800,
    },
    reviewText: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone400,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    tag: {
        backgroundColor: Colors.stone100,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: Colors.stone600,
    },
});

export default CollectionDetailScreen;
