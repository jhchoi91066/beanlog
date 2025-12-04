import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Full width minus padding
const CARD_HEIGHT = 240;
const SPACING = 20;

const FeaturedCarousel = ({ cafes, onPress }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    if (!cafes || cafes.length === 0) return null;

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress(item.id)}
                style={[
                    styles.cardContainer,
                    { marginLeft: index === 0 ? SPACING : 0, marginRight: SPACING }
                ]}
            >
                <View style={styles.card}>
                    {/* Image */}
                    <Image
                        source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop' }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Gradient Overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    >
                        <View style={styles.content}>
                            <View style={styles.badgeContainer}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Editor's Pick</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                                    <Ionicons name="star" size={10} color={Colors.amber400} />
                                    <Text style={[styles.badgeText, { marginLeft: 2 }]}>4.8</Text>
                                </View>
                            </View>

                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.address} numberOfLines={1}>{item.address}</Text>

                            {item.locationTags && item.locationTags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {item.locationTags.slice(0, 2).map((tag, idx) => (
                                        <Text key={idx} style={styles.tag}>#{tag}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>오늘의 추천 카페 ☕️</Text>
            <FlatList
                data={cafes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.stone800,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    listContent: {
        paddingRight: 20, // Add padding to the end
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.stone200,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
        justifyContent: 'flex-end',
        padding: 20,
    },
    content: {
        gap: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    badge: {
        backgroundColor: Colors.brand,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    address: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        fontSize: 12,
        color: Colors.amber400,
        fontWeight: '600',
    },
});

export default FeaturedCarousel;
