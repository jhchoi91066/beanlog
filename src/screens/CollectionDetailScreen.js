import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';
import CoffeeCard from '../components/CoffeeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCollectionItems, COLLECTIONS } from '../services/collectionService';
import { useTheme } from '../contexts/ThemeContext';

const CollectionDetailScreen = ({ navigation, route }) => {
    const { collectionId } = route.params;
    const { colors } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collectionInfo, setCollectionInfo] = useState(null);

    useEffect(() => {
        const info = COLLECTIONS.find(c => c.id === collectionId);
        setCollectionInfo(info);

        if (info) {
            navigation.setOptions({ title: info.title });
            loadItems();
        }
    }, [collectionId]);

    const loadItems = async () => {
        try {
            setLoading(true);
            // Fetch more items for the detail view
            const fetchedItems = await getCollectionItems(collectionId, 20);
            setItems(fetchedItems);
        } catch (error) {
            console.error('Error loading collection items:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!collectionInfo) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <CoffeeCard
                        post={item}
                        onPress={() => navigation.navigate('PostDetail', { post: item })}
                    />
                )}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{collectionInfo.title}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{collectionInfo.subtitle}</Text>
                    </View>
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                이 컬렉션에 아직 리뷰가 없습니다.
                            </Text>
                        </View>
                    )
                }
            />
            <LoadingSpinner visible={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.stone200,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});

export default CollectionDetailScreen;
