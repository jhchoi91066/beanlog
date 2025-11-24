// BeanLog - Category Detail Screen
// Ported from BeanLog2/src/components/explore/Explore.tsx (CategoryDetailView)

import React, { useState } from 'react';
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
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const { width } = Dimensions.get('window');

const CategoryDetailScreen = ({ navigation, route }) => {
    const { category } = route.params;
    const [activeTab, setActiveTab] = useState('cafes'); // 'cafes' or 'posts'

    // Mock Data
    const cafes = [1, 2, 3, 4, 5].map((i) => ({
        id: i,
        name: `카페 이름 #${i}`,
        location: "서울 성동구",
        image: `https://images.unsplash.com/photo-${1501339847302 + i * 1000000}-ac426a4a7cbb?w=200`,
        rating: (4 + (i % 10) / 10).toFixed(1),
        reviews: 120 + i * 30,
    }));

    const posts = [
        {
            id: "1",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
            title: "스페셜티 커피 입문 가이드",
            author: "커피마스터",
            likes: 234,
        },
        {
            id: "2",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
            title: "최고의 에티오피아 원두 5선",
            author: "원두탐험가",
            likes: 189,
        },
        {
            id: "3",
            image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
            title: "홈카페 추출 꿀팁",
            author: "홈바리스타",
            likes: 421,
        },
        {
            id: "4",
            image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
            title: "라떼아트 기초부터",
            author: "라떼장인",
            likes: 356,
        },
    ];

    const renderCafes = () => (
        <View style={styles.listContainer}>
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
                            <Text style={styles.cafeName}>{cafe.name}</Text>
                            <Text style={styles.cafeLocation}>{cafe.location}</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={14} color={Colors.amber400} />
                                <Text style={styles.ratingText}>{cafe.rating}</Text>
                                <Text style={styles.dotSeparator}>·</Text>
                                <Text style={styles.reviewText}>{cafe.reviews}개 리뷰</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPosts = () => (
        <View style={styles.postsGrid}>
            {posts.map((post) => (
                <TouchableOpacity
                    key={post.id}
                    style={styles.postCard}
                    activeOpacity={0.8}
                >
                    <View style={styles.postImageContainer}>
                        <Image source={{ uri: post.image }} style={styles.postImage} />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.postGradient}
                        >
                            <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.postMeta}>
                        <View style={styles.authorRow}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{post.author[0]}</Text>
                            </View>
                            <Text style={styles.authorName} numberOfLines={1}>{post.author}</Text>
                        </View>
                        <View style={styles.likesRow}>
                            <Ionicons name="heart" size={12} color={Colors.stone400} />
                            <Text style={styles.likesText}>{post.likes}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.stone800} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>#{category}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'cafes' && styles.activeTab]}
                    onPress={() => setActiveTab('cafes')}
                >
                    <Text style={[styles.tabText, activeTab === 'cafes' && styles.activeTabText]}>
                        카페
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                    onPress={() => setActiveTab('posts')}
                >
                    <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                        게시글
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'cafes' ? renderCafes() : renderPosts()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.stone100,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: Typography.h3.fontSize,
        fontWeight: Typography.h3.fontWeight,
        color: Colors.stone800,
    },
    placeholder: {
        width: 32,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: Colors.background,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: Colors.stone100,
    },
    activeTab: {
        backgroundColor: Colors.stone800,
    },
    tabText: {
        fontSize: Typography.button.fontSize,
        fontWeight: Typography.button.fontWeight,
        color: Colors.stone500,
    },
    activeTabText: {
        color: Colors.backgroundWhite,
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },

    // Cafe List
    listContainer: {
        gap: 12,
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
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cafeCardContent: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    cafeImage: {
        width: 72,
        height: 72,
        borderRadius: 8,
        backgroundColor: Colors.stone200,
    },
    cafeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cafeName: {
        fontSize: Typography.h4.fontSize,
        fontWeight: Typography.h4.fontWeight,
        color: Colors.stone800,
        marginBottom: 4,
    },
    cafeLocation: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone500,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: Typography.caption.fontSize,
        fontWeight: 'bold',
        color: Colors.stone800,
    },
    dotSeparator: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone300,
    },
    reviewText: {
        fontSize: Typography.captionSmall.fontSize,
        color: Colors.stone500,
    },

    // Posts Grid
    postsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    postCard: {
        width: (width - 32 - 12) / 2,
        marginBottom: 4,
    },
    postImageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        position: 'relative',
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    postGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
        justifyContent: 'flex-end',
        padding: 12,
    },
    postTitle: {
        color: '#FFFFFF',
        fontSize: Typography.caption.fontSize,
        fontWeight: Typography.label.fontWeight,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    postMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    avatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.stone200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 10,
        color: Colors.stone600,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 10,
        color: Colors.stone600,
        flex: 1,
    },
    likesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    likesText: {
        fontSize: 10,
        color: Colors.stone500,
    },
});

export default CategoryDetailScreen;
