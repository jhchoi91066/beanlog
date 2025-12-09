import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';
import CoffeeCard from './CoffeeCard';

const { width } = Dimensions.get('window');

const CollectionSection = ({ collection, navigation }) => {
    if (!collection.items || collection.items.length === 0) return null;

    return (
        <View style={styles.sectionContainer}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{collection.title}</Text>
                    <Text style={styles.subtitle}>{collection.subtitle}</Text>
                </View>
                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => navigation.navigate('CollectionDetail', { collectionId: collection.id })}
                >
                    <Text style={styles.moreButtonText}>더보기</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.stone400} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={collection.items}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={width * 0.75 + 16} // Card width + gap
                decelerationRate="fast"
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <CoffeeCard
                            post={item}
                            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                            compact={true} // Use compact mode for horizontal scroll
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreButtonText: {
        fontSize: 13,
        color: Colors.stone400,
        marginRight: 2,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingRight: 8, // Balance the gap
    },
    cardWrapper: {
        width: width * 0.75,
        marginRight: 16,
    },
});

export default CollectionSection;
