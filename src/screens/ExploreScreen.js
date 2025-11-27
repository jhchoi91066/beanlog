// BeanLog - Explore Screen
// Ported from BeanLog2/src/components/explore/Explore.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import { useTheme } from '../contexts';
import { getTrendingCafes } from '../services/exploreService';

const { width } = Dimensions.get('window');

const CURATED_COLLECTIONS = [
  {
    id: "1",
    title: "성수동 커피 투어",
    subtitle: "공장지대에서 피어난 커피향",
    image: "https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    cafes: 12,
    description: "과거 공장지대였던 성수동은 이제 서울의 핫플레이스로 자리잡았습니다. 독특한 인테리어와 훌륭한 커피를 자랑하는 카페들을 만나보세요.",
  },
  {
    id: "2",
    title: "비 오는 날, 따뜻한 라떼",
    subtitle: "감성 충전이 필요할 때",
    image: "https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    cafes: 8,
    description: "빗소리를 들으며 마시는 따뜻한 라떼 한 잔. 감성적인 분위기의 카페를 모았습니다.",
  },
  {
    id: "3",
    title: "스페셜티 입문하기",
    subtitle: "커피의 신세계로 초대합니다",
    image: "https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    cafes: 15,
    description: "스페셜티 커피의 세계에 첫 발을 내딛는 분들을 위한 큐레이션입니다.",
  },
];

const CATEGORIES = [
  "스페셜티",
  "디카페인",
  "핸드드립",
  "에스프레소바",
  "디저트맛집",
  "대형카페",
  "로스팅",
  "원두구매",
];

const ExploreScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [trendingCafes, setTrendingCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending cafes on mount
  useEffect(() => {
    fetchTrendingCafes();
  }, []);

  const fetchTrendingCafes = async () => {
    try {
      setLoading(true);
      const cafes = await getTrendingCafes();
      setTrendingCafes(cafes);
    } catch (error) {
      console.error('Error loading trending cafes:', error);
      // Keep empty array on error
      setTrendingCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('CollectionDetail', { collection });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryDetail', { category });
  };

  const handleCafePress = (cafe) => {
    // Use cafe.id which is already the cafeId from the service
    navigation.navigate('CafeDetail', { cafeId: cafe.id });
  };

  const handleMorePress = () => {
    // Navigate to Search tab with a prefilled search or just open it
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { prefilledSearch: 'Trending' }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>탐색하기</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>새로운 커피 경험을 발견해보세요.</Text>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={20} color={Colors.amber600} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>지금 뜨는 카페</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingScrollContent}
          >
            {loading ? (
              // Loading placeholder
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>로딩 중...</Text>
              </View>
            ) : trendingCafes.length === 0 ? (
              // Empty state
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>추천 카페가 없습니다</Text>
              </View>
            ) : (
              // Render trending cafes
              trendingCafes.map((cafe, index) => (
                <TouchableOpacity
                  key={cafe.firestoreId || index}
                  style={[styles.trendingCard, { backgroundColor: colors.backgroundWhite }]}
                  activeOpacity={0.8}
                  onPress={() => handleCafePress(cafe)}
                >
                  <View style={styles.trendingImageContainer}>
                    <Image source={{ uri: cafe.image }} style={styles.trendingImage} />
                    <View style={styles.trendBadge}>
                      <Ionicons name="trending-up" size={10} color="#FFFFFF" />
                      <Text style={styles.trendBadgeText}>{cafe.trend}</Text>
                    </View>
                  </View>
                  <View style={styles.trendingInfo}>
                    <Text style={[styles.trendingName, { color: colors.textPrimary }]}>{cafe.name}</Text>
                    <Text style={[styles.trendingLocation, { color: colors.textSecondary }]}>{cafe.location}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Editor's Pick Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles" size={20} color={Colors.amber600} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>이번 주 에디터 픽</Text>
            </View>
            <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
              <Text style={styles.moreButtonText}>더보기</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.amber600} />
            </TouchableOpacity>
          </View>

          <View style={styles.collectionsGrid}>
            {CURATED_COLLECTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.collectionCard}
                activeOpacity={0.9}
                onPress={() => handleCollectionPress(item)}
              >
                <Image source={{ uri: item.image }} style={styles.collectionImage} />
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                  style={styles.collectionGradient}
                >
                  <View style={styles.editorPickBadge}>
                    <Ionicons name="ribbon" size={10} color="#FFFFFF" />
                    <Text style={styles.editorPickText}>Editor's Pick</Text>
                  </View>
                  <Text style={styles.collectionTitle}>{item.title}</Text>
                  <Text style={styles.collectionSubtitle}>{item.subtitle}</Text>
                  <View style={styles.collectionMeta}>
                    <Ionicons name="cafe" size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.collectionMetaText}>{item.cafes}개 카페</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="cafe" size={20} color={Colors.amber600} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>카테고리별로 찾기</Text>
            </View>
          </View>

          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryCard, { backgroundColor: colors.backgroundWhite }]}
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[styles.categoryText, { color: colors.textSecondary }]}>#{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 12,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.stone800,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone500,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone800,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreButtonText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.buttonSmall.fontWeight,
    color: Colors.amber600,
  },

  // Trending Styles
  trendingScrollContent: {
    gap: 12,
    paddingRight: 24, // Add padding for last item
  },
  loadingContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone500,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone500,
  },
  trendingCard: {
    width: 160,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    overflow: 'hidden',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trendingImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444', // Red-500
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingInfo: {
    padding: 12,
  },
  trendingName: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
    marginBottom: 2,
  },
  trendingLocation: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },

  // Collection Styles
  collectionsGrid: {
    gap: 16,
  },
  collectionCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  editorPickBadge: {
    backgroundColor: Colors.amber500,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 12,
  },
  editorPickText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  collectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  collectionSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone200,
    marginBottom: 12,
  },
  collectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectionMetaText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Categories Styles
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 48 - 12) / 2, // (Screen width - padding - gap) / 2
    backgroundColor: Colors.backgroundWhite,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone700,
  },
});

export default ExploreScreen;
