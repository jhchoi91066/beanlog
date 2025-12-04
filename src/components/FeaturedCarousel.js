import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 200;
const PADDING = 24;

const FeaturedCarousel = ({ data = [], onPressItem }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Editor's Pick</Text>
                <Text style={styles.subtitle}>오늘의 추천 카페</Text>
            </View>

            <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 8} // Adjust for padding
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {data.map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={item.id || index}
                            activeOpacity={0.9}
                            onPress={() => onPressItem && onPressItem(item)}
                            style={styles.cardContainer}
                        >
                            <View style={styles.card}>
                                <Image
                                    source={{ uri: item.imageUrl || item.thumbnailUrl }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.gradient}
                                >
                                    <View style={styles.textContainer}>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>FEATURED</Text>
                                        </View>
                                        <Text style={styles.cafeName} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.description} numberOfLines={1}>
                                            {item.description || item.address}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </Animated.ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {data.map((_, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 1.2, 0.8],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                { opacity, transform: [{ scale }] }
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        ...Typography.h3,
        color: Colors.textPrimary,
        fontWeight: '700',
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    scrollContent: {
        paddingHorizontal: 12, // Half of 24 to center cards with gap
    },
    cardContainer: {
        width: width - 24, // Full width minus padding
        paddingHorizontal: 12,
    },
    card: {
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.stone200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
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
    textContainer: {
        gap: 4,
    },
    badge: {
        backgroundColor: Colors.brand,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    badgeText: {
        color: Colors.backgroundWhite,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    cafeName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.backgroundWhite,
    },
    description: {
        fontSize: 14,
        color: Colors.stone200,
        opacity: 0.9,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.brand,
    },
});

export default FeaturedCarousel;
