import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getTopRatedReviews } from '../services/feedService';
import CoffeeCard from '../components/CoffeeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CoffeeCardSkeleton from '../components/CoffeeCardSkeleton';
import { Colors, Typography } from '../constants';

const RankingScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRanking();
    }, []);

    const loadRanking = async () => {
        try {
            setLoading(true);
            const data = await getTopRatedReviews(10);
            setRankingData(data);
        } catch (error) {
            console.error('Error loading ranking:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadRanking();
    };

    const handlePress = (post) => {
        navigation.navigate('CafeDetail', { cafeId: post.cafeId });
    };

    const renderItem = ({ item, index }) => {
        // Transform review data to post format if needed
        // Assuming getTopRatedReviews returns data compatible with CoffeeCard or we transform it
        // CoffeeCard expects 'post' object. 
        // feedService.getTopRatedReviews returns review objects.
        // We might need transformation logic similar to FeedHomeScreen.

        // Let's copy the transformation logic from FeedHomeScreen or ensure CoffeeCard handles it.
        // CoffeeCard expects: id, cafeName, coffeeName, location, imageUrl, rating, tags, flavorProfile, author...

        // For now, let's assume the data is raw review data and transform it on the fly
        const post = {
            ...item,
            imageUrl: item.photoUrls?.[0] || null,
            location: item.cafeAddress || item.location,
            author: {
                name: item.userDisplayName || '익명',
                avatar: item.userPhotoURL || null,
                level: 'Barista'
            },
            date: item.createdAt?.toDate?.()?.toLocaleDateString() || '최근',
            description: item.comment,
            tags: item.basicTags || [],
            flavorProfile: item.flavorProfile || {
                acidity: item.acidity || 0,
                sweetness: item.sweetness || 0,
                body: item.body || 0,
                bitterness: item.bitterness || 0,
                aroma: item.aroma || 0,
            }
        };

        return (
            <View style={styles.cardContainer}>
                <View style={[
                    styles.rankingBadge,
                    index === 0 ? { backgroundColor: '#FFD700' } : // Gold
                        index === 1 ? { backgroundColor: '#C0C0C0' } : // Silver
                            index === 2 ? { backgroundColor: '#CD7F32' } : // Bronze
                                { backgroundColor: colors.stone200 }
                ]}>
                    <Text style={[
                        styles.rankingText,
                        index < 3 ? { color: 'white', fontWeight: 'bold' } : { color: colors.textSecondary }
                    ]}>
                        {index + 1}위
                    </Text>
                </View>
                <CoffeeCard post={post} onPress={() => handlePress(post)} />
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, padding: 16 }]}>
                {[1, 2, 3].map((key) => (
                    <View key={key} style={{ marginBottom: 24 }}>
                        <CoffeeCardSkeleton />
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={rankingData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            랭킹 데이터가 없습니다.
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: 24,
        position: 'relative',
    },
    rankingBadge: {
        position: 'absolute',
        top: -10,
        left: 10,
        zIndex: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    rankingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});

export default RankingScreen;
