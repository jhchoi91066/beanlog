import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

const CoffeeCardSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Image Placeholder */}
            <SkeletonLoader width="100%" height={width - 32} borderRadius={0} />

            {/* Content Section */}
            <View style={styles.content}>
                {/* Header: Coffee Name & Cafe Name */}
                <View style={styles.header}>
                    <View>
                        <SkeletonLoader width={180} height={24} style={{ marginBottom: 8 }} />
                        <SkeletonLoader width={120} height={16} />
                    </View>
                    <SkeletonLoader width={24} height={24} borderRadius={12} />
                </View>

                {/* Description Lines */}
                <View style={styles.description}>
                    <SkeletonLoader width="100%" height={14} style={{ marginBottom: 6 }} />
                    <SkeletonLoader width="80%" height={14} />
                </View>

                {/* Flavor Profile Radar Placeholder */}
                <View style={styles.flavorProfile}>
                    <SkeletonLoader width={140} height={140} borderRadius={70} />
                </View>

                {/* Tags */}
                <View style={styles.tags}>
                    <SkeletonLoader width={60} height={24} borderRadius={12} style={{ marginRight: 8 }} />
                    <SkeletonLoader width={70} height={24} borderRadius={12} style={{ marginRight: 8 }} />
                    <SkeletonLoader width={50} height={24} borderRadius={12} />
                </View>
            </View>

            {/* Footer: User & Interactions */}
            <View style={styles.footer}>
                <View style={styles.user}>
                    <SkeletonLoader width={24} height={24} borderRadius={12} style={{ marginRight: 8 }} />
                    <SkeletonLoader width={80} height={16} />
                </View>
                <View style={styles.interactions}>
                    <SkeletonLoader width={40} height={16} style={{ marginRight: 16 }} />
                    <SkeletonLoader width={40} height={16} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.stone100,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    description: {
        marginBottom: 20,
    },
    flavorProfile: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: Colors.stone50,
        borderRadius: 12,
        padding: 12,
    },
    tags: {
        flexDirection: 'row',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.stone100,
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactions: {
        flexDirection: 'row',
    },
});

export default CoffeeCardSkeleton;
