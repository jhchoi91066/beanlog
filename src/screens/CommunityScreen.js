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
    Alert,
    ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useFocusEffect } from '@react-navigation/native';
import { getPosts, toggleLike, toggleBookmark, sharePost, deletePost } from '../services/communityService';
import LoadingSpinner from '../components/LoadingSpinner';
import { auth } from '../services/firebase';

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
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadPosts();
        }, [])
    );

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await getPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const result = await toggleLike(postId);
            // Update local state
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, isLiked: result.isLiked, likes: result.likes }
                        : post
                )
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const isBookmarked = await toggleBookmark(postId);
            // Update local state
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, isBookmarked }
                        : post
                )
            );
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleShare = async (post) => {
        try {
            await sharePost(post);
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    const handleEditPost = (post) => {
        // Navigate to WritePost screen with post data for editing
        navigation.navigate('WritePost', {
            editMode: true,
            post: post
        });
    };

    const handleDeletePost = async (postId) => {
        try {
            await deletePost(postId);
            // Remove post from local state
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            Alert.alert('성공', '게시글이 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('오류', error.message || '게시글 삭제에 실패했습니다.');
        }
    };

    const handlePostMenu = (post, event) => {
        // Prevent navigation to post detail
        event?.stopPropagation();

        const currentUser = auth.currentUser;
        const isAuthor = currentUser && post.userId === currentUser.uid;

        // Different options for author vs non-author
        const options = isAuthor
            ? ['게시글 수정', '게시글 삭제', '링크 복사', '취소']
            : ['링크 복사', '신고하기', '취소'];

        const destructiveButtonIndex = isAuthor ? 1 : 1;
        const cancelButtonIndex = isAuthor ? 3 : 2;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    destructiveButtonIndex,
                    cancelButtonIndex,
                },
                (buttonIndex) => {
                    if (isAuthor) {
                        if (buttonIndex === 0) {
                            // Edit post
                            handleEditPost(post);
                        } else if (buttonIndex === 1) {
                            // Delete post
                            Alert.alert(
                                '게시글 삭제',
                                '정말로 이 게시글을 삭제하시겠습니까?',
                                [
                                    { text: '취소', style: 'cancel' },
                                    {
                                        text: '삭제',
                                        style: 'destructive',
                                        onPress: () => handleDeletePost(post.id)
                                    }
                                ]
                            );
                        } else if (buttonIndex === 2) {
                            // Copy link
                            Alert.alert('성공', '링크가 복사되었습니다.');
                        }
                    } else {
                        if (buttonIndex === 0) {
                            // Copy link
                            Alert.alert('성공', '링크가 복사되었습니다.');
                        } else if (buttonIndex === 1) {
                            // Report
                            Alert.alert('알림', '신고 기능은 준비중입니다.');
                        }
                    }
                }
            );
        } else {
            // Android - use Alert.alert with buttons
            if (isAuthor) {
                Alert.alert(
                    '게시글 관리',
                    '작업을 선택하세요',
                    [
                        {
                            text: '게시글 수정',
                            onPress: () => handleEditPost(post)
                        },
                        {
                            text: '게시글 삭제',
                            style: 'destructive',
                            onPress: () => {
                                Alert.alert(
                                    '게시글 삭제',
                                    '정말로 이 게시글을 삭제하시겠습니까?',
                                    [
                                        { text: '취소', style: 'cancel' },
                                        {
                                            text: '삭제',
                                            style: 'destructive',
                                            onPress: () => handleDeletePost(post.id)
                                        }
                                    ]
                                );
                            }
                        },
                        {
                            text: '링크 복사',
                            onPress: () => Alert.alert('성공', '링크가 복사되었습니다.')
                        },
                        { text: '취소', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert(
                    '게시글 관리',
                    '작업을 선택하세요',
                    [
                        {
                            text: '링크 복사',
                            onPress: () => Alert.alert('성공', '링크가 복사되었습니다.')
                        },
                        {
                            text: '신고하기',
                            style: 'destructive',
                            onPress: () => Alert.alert('알림', '신고 기능은 준비중입니다.')
                        },
                        { text: '취소', style: 'cancel' }
                    ]
                );
            }
        }
    };

    const filterPosts = (posts) => {
        if (activeTab === 'all') return posts;
        return posts.filter(post => post.type === activeTab);
    };

    const filteredPosts = filterPosts(posts);

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
                    <TouchableOpacity onPress={(e) => handlePostMenu(post, e)}>
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
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => handleLike(post.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={post.isLiked ? "thumbs-up" : "thumbs-up-outline"} size={16} color={post.isLiked ? Colors.brand : Colors.textSecondary} />
                            <Text style={[styles.statText, post.isLiked && { color: Colors.brand }]}>{post.likes}</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleBookmark(post.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={post.isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color={post.isBookmarked ? Colors.brand : Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleShare(post)}
                            activeOpacity={0.7}
                        >
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
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.purpleLight, borderColor: Colors.purpleLight }]}
                        onPress={() => navigation.navigate('WritePost', { initialCategory: 'question' })}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={Colors.purple} />
                        <Text style={[styles.actionText, { color: Colors.purple }]}>질문하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.brandLight, borderColor: Colors.brandLight }]}
                        onPress={() => navigation.navigate('WritePost', { initialCategory: 'tip' })}
                    >
                        <Ionicons name="bulb-outline" size={24} color={Colors.brand} />
                        <Text style={[styles.actionText, { color: Colors.brand }]}>팁 공유</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: Colors.blueLight, borderColor: Colors.blueLight }]}
                        onPress={() => navigation.navigate('WritePost', { initialCategory: 'discussion' })}
                    >
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
