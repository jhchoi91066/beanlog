import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock Data
const MOCK_POSTS = [
    {
        id: '1',
        type: 'question',
        title: '에스프레소 추출 시간이 너무 빠른데 원인이 뭘까요?',
        content: '새로 산 그라인더로 추출하는데 18초만에 2온스가 나와버려요. 분쇄도를 더 곱게 해야 할까요? 아니면 다른 문제일까요?',
        author: {
            name: '커피초보',
            avatar: 'https://i.pravatar.cc/150?u=user1',
            level: 'Starter',
        },
        tags: ['에스프레소', '추출', '그라인더'],
        likes: 23,
        comments: 15,
        views: 342,
        timeAgo: '30분 전',
        category: '추출 기술',
        isSolved: false,
    },
    {
        id: '2',
        type: 'tip',
        title: '홈카페에서 라떼아트 연습하는 5가지 팁',
        content: '1년간 연습한 결과 깨달은 것들을 정리해봤어요. 우유 스티밍 온도, 각도, 푸어링 타이밍 등 실전 팁들입니다.',
        author: {
            name: '라떼마스터',
            avatar: 'https://i.pravatar.cc/150?u=user2',
            level: 'Expert',
        },
        tags: ['라떼아트', '홈카페', '우유스티밍'],
        likes: 156,
        comments: 34,
        views: 1289,
        timeAgo: '2시간 전',
        category: '팁&노하우',
        isBookmarked: true,
    },
    {
        id: '3',
        type: 'discussion',
        title: '에티오피아 vs 콜롬비아, 산미 좋아하면 어디 원두가 더 좋을까요?',
        content: '산미를 선호하는데 에티오피아 예가체프와 콜롬비아 수프리모 중에 고민됩니다. 둘 다 마셔보신 분들 의견이 궁금해요!',
        author: {
            name: '원두탐험가',
            avatar: 'https://i.pravatar.cc/150?u=user3',
            level: 'Pro',
        },
        tags: ['원두', '산미', '에티오피아', '콜롬비아'],
        likes: 45,
        comments: 28,
        views: 567,
        timeAgo: '4시간 전',
        category: '원두&로스팅',
        isLiked: true,
    },
    {
        id: '4',
        type: 'question',
        title: '핸드드립 온도는 몇도가 가장 적당한가요?',
        content: '보통 92-96도 사이라고 하던데, 원두에 따라 다른가요? 요즘 케냐 원두 사용 중인데 너무 뜨거운 물로 하면 쓴맛이 나는 것 같아요.',
        author: {
            name: '드립러버',
            avatar: 'https://i.pravatar.cc/150?u=user4',
            level: 'Barista',
        },
        tags: ['핸드드립', '온도', '추출'],
        likes: 67,
        comments: 42,
        views: 892,
        timeAgo: '6시간 전',
        category: '추출 기술',
        isSolved: true,
    },
    {
        id: '5',
        type: 'tip',
        title: '카페에서 일하며 배운 우유 거품 만드는 비법',
        content: '바리스타로 일한 지 3년차인데, 처음 배울 때 몰랐던 것들을 공유합니다. 특히 우유 온도 체크하는 팁이 유용할 거예요.',
        author: {
            name: '바리스타김',
            avatar: 'https://i.pravatar.cc/150?u=user5',
            level: 'Expert',
        },
        tags: ['바리스타', '우유거품', '카페'],
        likes: 189,
        comments: 56,
        views: 2134,
        timeAgo: '1일 전',
        category: '팁&노하우',
    },
];

const Colors = {
    background: '#FAFAF9', // stone-50
    card: '#FFFFFF',
    text: '#292524', // stone-800
    textSecondary: '#78716C', // stone-500
    brand: '#D97706', // amber-600
    brandLight: '#FEF3C7', // amber-100
    border: '#E7E5E4', // stone-200
    blue: '#2563EB',
    blueLight: '#EFF6FF',
    purple: '#9333EA',
    purpleLight: '#FAF5FF',
    green: '#16A34A',
};

const CommunityScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');

    const filterPosts = (posts) => {
        if (activeTab === 'all') return posts;
        return posts.filter(post => post.type === activeTab);
    };

    const filteredPosts = filterPosts(MOCK_POSTS);

    const getTypeConfig = (type) => {
        switch (type) {
            case 'discussion':
                return { icon: 'chatbubbles-outline', label: '토론', color: Colors.blue, bg: Colors.blueLight };
            case 'question':
                return { icon: 'help-circle-outline', label: '질문', color: Colors.purple, bg: Colors.purpleLight };
            case 'tip':
                return { icon: 'bulb-outline', label: '팁', color: Colors.brand, bg: Colors.brandLight };
            default:
                return { icon: 'document-text-outline', label: '일반', color: Colors.textSecondary, bg: Colors.border };
        }
    };

    const renderPostCard = (post) => {
        const config = getTypeConfig(post.type);

        return (
            <TouchableOpacity
                key={post.id}
                style={styles.card}
                onPress={() => navigation.navigate('PostDetail', { post })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.authorContainer}>
                        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
                        <View>
                            <View style={styles.authorRow}>
                                <Text style={styles.authorName}>{post.author.name}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{post.author.level}</Text>
                                </View>
                                {post.isSolved && (
                                    <View style={styles.solvedBadge}>
                                        <Ionicons name="checkmark-circle" size={12} color={Colors.green} />
                                        <Text style={styles.solvedText}>해결됨</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaText}>{post.timeAgo}</Text>
                                <Text style={styles.metaDot}>·</Text>
                                <Text style={styles.metaText}>{post.category}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                        <Ionicons name={config.icon} size={16} color={config.color} style={styles.typeIcon} />
                        <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                    </View>
                    <Text style={styles.postBody} numberOfLines={2}>{post.content}</Text>
                </View>

                <View style={styles.tagContainer}>
                    {post.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name={post.isLiked ? "thumbs-up" : "thumbs-up-outline"} size={16} color={post.isLiked ? Colors.brand : Colors.textSecondary} />
                            <Text style={[styles.statText, post.isLiked && { color: Colors.brand }]}>{post.likes}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{post.comments}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={16} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{post.views}</Text>
                        </View>
                    </View>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name={post.isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color={post.isBookmarked ? Colors.brand : Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="share-social-outline" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>커뮤니티</Text>
                    <Text style={styles.headerSubtitle}>커피 애호가들과 지식을 나눠보세요</Text>
                </View>
                <TouchableOpacity
                    style={styles.writeButton}
                    onPress={() => navigation.navigate('WritePost')}
                >
                    <Ionicons name="pencil" size={16} color="#FFF" />
                    <Text style={styles.writeButtonText}>글쓰기</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.purpleLight, borderColor: Colors.purpleLight }]}>
                        <Ionicons name="help-circle-outline" size={24} color={Colors.purple} />
                        <Text style={[styles.actionText, { color: Colors.purple }]}>질문하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.brandLight, borderColor: Colors.brandLight }]}>
                        <Ionicons name="bulb-outline" size={24} color={Colors.brand} />
                        <Text style={[styles.actionText, { color: Colors.brand }]}>팁 공유</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.blueLight, borderColor: Colors.blueLight }]}>
                        <Ionicons name="chatbubbles-outline" size={24} color={Colors.blue} />
                        <Text style={[styles.actionText, { color: Colors.blue }]}>토론하기</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                    {['all', 'discussion', 'question', 'tip'].map((tab) => {
                        const isActive = activeTab === tab;
                        let label = '전체';
                        if (tab === 'discussion') label = '토론';
                        if (tab === 'question') label = '질문';
                        if (tab === 'tip') label = '팁';

                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, isActive && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Posts List */}
                <View style={styles.postsList}>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(renderPostCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="cafe-outline" size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    writeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    writeButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    quickActions: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tabsContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: Colors.text,
        borderColor: Colors.text,
    },
    tabText: {
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFF',
    },
    postsList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    authorContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.border,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    authorName: {
        fontWeight: '600',
        color: Colors.text,
        fontSize: 14,
    },
    badge: {
        backgroundColor: Colors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    solvedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    solvedText: {
        fontSize: 10,
        color: Colors.green,
        fontWeight: '500',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    metaDot: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginHorizontal: 4,
    },
    cardContent: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    typeIcon: {
        marginTop: 2,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    postBody: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.background,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: Colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    emptyText: {
        marginTop: 12,
        color: Colors.textSecondary,
        fontSize: 14,
    },
});

export default CommunityScreen;
