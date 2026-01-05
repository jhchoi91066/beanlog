import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../constants';
import CoffeeCard from '../components/CoffeeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getReviewsByUserId } from '../services/feedService';
import { followUser, unfollowUser, checkIsFollowing } from '../services/followService';

const UserProfileScreen = ({ navigation, route }) => {
    const { userId, userDisplayName, userPhotoURL } = route.params;
    const { user } = useAuth();
    const { colors } = useTheme();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadProfileData();
    }, [userId]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchReviews(),
                checkFollowStatus()
            ]);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        const fetchedReviews = await getReviewsByUserId(userId);
        setReviews(fetchedReviews);
    };

    const checkFollowStatus = async () => {
        if (user && user.uid !== userId) {
            const following = await checkIsFollowing(user.uid, userId);
            setIsFollowing(following);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReviews();
        setRefreshing(false);
    };

    const handleFollowToggle = async () => {
        if (!user) {
            Alert.alert('로그인 필요', '팔로우하려면 로그인이 필요합니다.');
            return;
        }
        if (user.uid === userId) return;

        try {
            setFollowLoading(true);
            if (isFollowing) {
                await unfollowUser(user.uid, userId);
                setIsFollowing(false);
            } else {
                await followUser(user.uid, userId);
                setIsFollowing(true);
            }
        } catch (error) {
            Alert.alert('오류', '작업을 처리할 수 없습니다.');
        } finally {
            setFollowLoading(false);
        }
    };

    // Calculate stats
    const totalReviews = reviews.length;
    const totalLikes = reviews.reduce((sum, r) => sum + (r.likes || 0), 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {/* Profile Header (Passport Style) */}
                <View style={[styles.headerCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 }]}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: userPhotoURL || 'https://via.placeholder.com/100' }}
                            style={styles.avatar}
                        />
                        <View style={styles.userText}>
                            <Text style={[styles.userName, { color: colors.textPrimary }]}>{userDisplayName || '익명'}</Text>
                            <Text style={[styles.userTitle, { color: colors.textSecondary }]}>Coffee Explorer</Text>
                        </View>

                        {/* Follow Button */}
                        {user && user.uid !== userId && (
                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    isFollowing ? { backgroundColor: colors.stone200 } : { backgroundColor: colors.brand }
                                ]}
                                onPress={handleFollowToggle}
                                disabled={followLoading}
                            >
                                <Text style={[
                                    styles.followButtonText,
                                    isFollowing ? { color: colors.textPrimary } : { color: colors.backgroundWhite }
                                ]}>
                                    {isFollowing ? '팔로잉' : '팔로우'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Stats */}
                    <View style={[styles.statsContainer, { borderTopColor: colors.stone100 }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalReviews}</Text>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>리뷰</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalLikes}</Text>
                            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>받은 좋아요</Text>
                        </View>
                    </View>
                </View>

                {/* Reviews List */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>작성한 리뷰</Text>

                {loading ? (
                    <LoadingSpinner visible={true} fullScreen={false} />
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <CoffeeCard
                            key={review.id}
                            post={review}
                            onPress={() => navigation.navigate('PostDetail', { post: review })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>아직 작성한 리뷰가 없습니다.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    headerCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        ...Shadows.card,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    userText: {
        flex: 1,
    },
    userName: {
        ...Typography.h2,
        fontWeight: '700', // Keep bold for name
        marginBottom: 4,
    },
    userTitle: {
        ...Typography.caption,
    },
    followButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    followButtonText: {
        ...Typography.buttonSmall,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...Typography.h3,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.stone200,
    },
    sectionTitle: {
        ...Typography.h3,
        marginBottom: 16,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
});

export default UserProfileScreen;
