import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { followUser, unfollowUser } from '../services/followService';

const MOCK_RECOMMENDED_USERS = [
    {
        userId: 'mock_user_1',
        displayName: 'Barista Kim',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        title: 'Pro Barista',
        isFollowing: false,
    },
    {
        userId: 'mock_user_2',
        displayName: 'Coffee Lover',
        photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        title: 'Cafe Explorer',
        isFollowing: false,
    },
    {
        userId: 'mock_user_3',
        displayName: 'Bean Hunter',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        title: 'Roaster',
        isFollowing: false,
    },
];

const RecommendationHeader = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const [users, setUsers] = useState(MOCK_RECOMMENDED_USERS);

    const handleFollowToggle = async (targetUser) => {
        if (!user) return; // Should prompt login in real app

        try {
            const isFollowing = targetUser.isFollowing;

            // Optimistic update
            setUsers(prev => prev.map(u =>
                u.userId === targetUser.userId ? { ...u, isFollowing: !isFollowing } : u
            ));

            if (isFollowing) {
                await unfollowUser(user.uid, targetUser.userId);
            } else {
                await followUser(user.uid, targetUser.userId);
            }
        } catch (error) {
            console.error('Follow toggle error:', error);
            // Revert optimization
            setUsers(prev => prev.map(u =>
                u.userId === targetUser.userId ? { ...u, isFollowing: targetUser.isFollowing } : u
            ));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    추천 에디터
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.moreText, { color: colors.textSecondary }]}>더보기</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            >
                {users.map((item) => (
                    <TouchableOpacity
                        key={item.userId}
                        style={[styles.userCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 }]}
                        onPress={() => navigation.navigate('UserProfile', {
                            userId: item.userId,
                            userDisplayName: item.displayName,
                            userPhotoURL: item.photoURL
                        })}
                    >
                        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{item.displayName}</Text>
                        <Text style={[styles.userTitle, { color: colors.textSecondary }]} numberOfLines={1}>{item.title}</Text>

                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                item.isFollowing ? { backgroundColor: colors.stone200 } : { backgroundColor: colors.brand }
                            ]}
                            onPress={() => handleFollowToggle(item)}
                        >
                            <Text style={[
                                styles.followText,
                                item.isFollowing ? { color: colors.textPrimary } : { color: colors.backgroundWhite }
                            ]}>
                                {item.isFollowing ? '팔로잉' : '팔로우'}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    moreText: {
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingRight: 12, // Compensation for marginRight of last item
    },
    userCard: {
        width: 120,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        marginRight: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
    },
    userTitle: {
        fontSize: 11,
        marginBottom: 12,
        textAlign: 'center',
    },
    followButton: {
        width: '100%',
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    followText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default RecommendationHeader;
