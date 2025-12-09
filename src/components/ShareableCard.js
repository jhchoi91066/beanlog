import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import InteractiveFlavorRadar from './InteractiveFlavorRadar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 320; // Fixed width for consistency
const CARD_HEIGHT = 568; // 9:16 ratio approx

const ShareableCard = ({ user, stats, achievements, flavorProfile }) => {
    // Get unlocked achievements count
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // Get latest 3 unlocked stamps
    const latestStamps = achievements
        .filter(a => a.unlocked)
        .sort((a, b) => (b.unlockedAt?.seconds || 0) - (a.unlockedAt?.seconds || 0))
        .slice(0, 3);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.stone800, Colors.stone900]}
                style={styles.gradient}
            >
                {/* Header / Branding */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="cafe" size={24} color={Colors.brand} />
                        <Text style={styles.logoText}>BeanLog</Text>
                    </View>
                    <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                </View>

                {/* User Profile */}
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: user?.photoURL || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user?.displayName || 'Coffee Lover'}</Text>
                    <Text style={styles.userLevel}>Barista Level</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats?.totalReviews || 0}</Text>
                        <Text style={styles.statLabel}>Reviews</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats?.visitedCafes || 0}</Text>
                        <Text style={styles.statLabel}>Cafes</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{unlockedCount}</Text>
                        <Text style={styles.statLabel}>Stamps</Text>
                    </View>
                </View>

                {/* Flavor Profile Showcase */}
                <View style={styles.stampsSection}>
                    <Text style={styles.sectionTitle}>My Taste Profile</Text>
                    <View style={{ pointerEvents: 'none' }}>
                        <InteractiveFlavorRadar
                            data={[
                                { subject: '산미', A: flavorProfile?.acidity || 0, fullMark: 5 },
                                { subject: '단맛', A: flavorProfile?.sweetness || 0, fullMark: 5 },
                                { subject: '바디', A: flavorProfile?.body || 0, fullMark: 5 },
                                { subject: '쓴맛', A: flavorProfile?.bitterness || 0, fullMark: 5 },
                                { subject: '향', A: flavorProfile?.aroma || 0, fullMark: 5 },
                            ]}
                            size={200}
                            readOnly={true}
                        />
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Discover your perfect cup.</Text>
                    <Text style={styles.footerUrl}>beanlog.app</Text>
                </View>

                {/* Decorative Elements */}
                <Ionicons name="cafe-outline" size={200} color="rgba(255,255,255,0.03)" style={styles.bgIcon} />
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: Colors.stone900,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontSize: Typography.h4.fontSize,
        fontWeight: '700',
        color: Colors.backgroundWhite,
        letterSpacing: 1,
    },
    date: {
        fontSize: Typography.caption.fontSize,
        color: Colors.stone400,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: Colors.brand,
        marginBottom: 12,
    },
    userName: {
        fontSize: Typography.h3.fontSize,
        fontWeight: '700',
        color: Colors.backgroundWhite,
        marginBottom: 4,
    },
    userLevel: {
        fontSize: Typography.body.fontSize,
        color: Colors.brand,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        paddingVertical: 16,
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginVertical: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.backgroundWhite,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.stone400,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    stampsSection: {
        width: '100%',
        alignItems: 'center',
        flex: 1,
    },
    sectionTitle: {
        fontSize: Typography.body.fontSize,
        color: Colors.stone300,
        marginBottom: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    stampsRow: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
    },
    stampItem: {
        alignItems: 'center',
        width: 80,
    },
    stampIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 165, 0, 0.1)', // Amber with opacity
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.brand,
        marginBottom: 8,
    },
    stampName: {
        fontSize: 10,
        color: Colors.stone300,
        textAlign: 'center',
    },
    emptyText: {
        color: Colors.stone500,
        fontSize: 14,
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 14,
        color: Colors.stone400,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    footerUrl: {
        fontSize: 12,
        color: Colors.stone600,
        fontWeight: '600',
        letterSpacing: 1,
    },
    bgIcon: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        zIndex: -1,
    },
});

export default ShareableCard;
