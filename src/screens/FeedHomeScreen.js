// BeanLog - Feed Home Screen (Redesigned to match BeanLog_design)
// Matches web design structure with tabs, filters, and coffee feed

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import { CoffeeCard, LoadingSpinner, FeaturedCarousel } from '../components';
import CoffeeCardSkeleton from '../components/CoffeeCardSkeleton';
import NaverMapView from '../components/NaverMapView';
import { getRecentReviews, getReviewsByTag, getPersonalizedFeed, getTopRatedReviews } from '../services/feedService';
import { getAllCafes } from '../services/cafeService';
import { useTheme } from '../contexts';
import { useAuth } from '../contexts/AuthContext';

// Filter tags for coffee preferences (matches web design)
const FILTER_TAGS = ['전체', '산미있는', '고소한', '디카페인', '핸드드립', '라떼맛집', '뷰맛집'];

// Mock Data (fallback when Firebase is empty - can be removed once real data exists)
// TODO: Remove this after populating Firebase with real data
const MOCK_POSTS = [
  {
    id: 'mock-1',
    cafeName: '블루보틀 성수',
    coffeeName: '뉴올리언스',
    location: '서울 성동구',
    imageUrl: 'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    tags: ['달콤함', '부드러움', '시그니처'],
    flavorProfile: {
      acidity: 2,
      sweetness: 5,
      body: 4,
      bitterness: 2,
      aroma: 4,
    },
    author: {
      name: '커피러버',
      avatar: 'https://i.pravatar.cc/150?u=1',
      level: 'Barista',
    },
    description: '블루보틀의 시그니처 메뉴. 치커리와 섞은 콜드브루에 우유와 유기농 설탕을 넣어 달콤하고 부드러운 맛이 일품입니다.',
    likes: 124,
    comments: 12,
    date: '2시간 전',
  },
  {
    id: 'mock-2',
    cafeName: '앤트러사이트 합정',
    coffeeName: '공기와 꿈 드립',
    location: '서울 마포구',
    imageUrl: 'https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.5,
    tags: ['산미', '꽃향기', '깔끔함'],
    flavorProfile: {
      acidity: 5,
      sweetness: 3,
      body: 2,
      bitterness: 1,
      aroma: 5,
    },
    author: {
      name: '브루잉마스터',
      avatar: 'https://i.pravatar.cc/150?u=2',
      level: 'Pro',
    },
    description: '에티오피아 원두 특유의 화사한 산미가 돋보입니다. 식으면서 더 살아나는 베리류의 향미가 매력적이에요.',
    likes: 89,
    comments: 5,
    date: '5시간 전',
  },
  {
    id: 'mock-3',
    cafeName: '프릳츠 도화',
    coffeeName: '잘 되어 가시나',
    location: '서울 마포구',
    imageUrl: 'https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    tags: ['밸런스', '견과류', '데일리'],
    flavorProfile: {
      acidity: 3,
      sweetness: 4,
      body: 4,
      bitterness: 3,
      aroma: 3,
    },
    author: {
      name: '데일리커피',
      avatar: 'https://i.pravatar.cc/150?u=3',
      level: 'Starter',
    },
    description: '매일 마셔도 질리지 않는 훌륭한 밸런스. 고소한 견과류의 풍미와 은은한 단맛이 조화롭습니다.',
    likes: 210,
    comments: 34,
    date: '1일 전',
  },
  {
    id: 'mock-4',
    cafeName: '모모스 커피',
    coffeeName: '에스 쇼콜라',
    location: '부산 영도구',
    imageUrl: 'https://images.unsplash.com/photo-1751956066306-c5684cbcf385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYWZlJTIwaW50ZXJpb3IlMjBjb3p5fGVufDF8fHx8MTc2MzcxMDM4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    tags: ['다크초콜릿', '묵직함', '라떼추천'],
    flavorProfile: {
      acidity: 1,
      sweetness: 4,
      body: 5,
      bitterness: 4,
      aroma: 3,
    },
    author: {
      name: '라떼장인',
      avatar: 'https://i.pravatar.cc/150?u=4',
      level: 'Expert',
    },
    description: '이름처럼 다크 초콜릿의 쌉싸름함과 단맛이 진하게 느껴집니다. 우유와 섞였을 때 그 진가가 발휘되는 원두.',
    likes: 156,
    comments: 18,
    date: '2일 전',
  },
];

const FeedHomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth(); // Get user for personalization
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null); // Store user preferences

  // Location & Nearby cafes state
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [featuredCafes, setFeaturedCafes] = useState([]);

  // Load feed data on mount and when filter changes
  useEffect(() => {
    loadPreferencesAndFeed();

    // Prepare featured cafes from mock posts
    const featured = MOCK_POSTS.slice(0, 3).map(post => ({
      id: post.id,
      name: post.cafeName,
      address: post.location,
      thumbnailUrl: post.imageUrl,
      locationTags: post.tags,
      rating: post.rating
    }));
    setFeaturedCafes(featured);
  }, []);

  useEffect(() => {
    // Reload when filter changes
    if (activeTab === 'feed') {
      loadFeed();
    }
  }, [selectedFilter, activeTab]);

  // Request location when "내 주변" tab is activated
  useEffect(() => {
    if (activeTab === 'nearby' && !userLocation && locationPermission !== 'denied') {
      requestLocationPermission();
    }
  }, [activeTab]);

  /**
   * Load user preferences first, then load feed
   */
  const loadPreferencesAndFeed = async () => {
    try {
      // Try to get preferences from AsyncStorage (saved during onboarding)
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      if (storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs);
        setUserPreferences(parsedPrefs);
        console.log('Loaded user preferences:', parsedPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      loadFeed();
    }
  };

  /**
   * Load community feed from Firebase
   * Applies current filter selection and personalization
   */
  const loadFeed = async () => {
    try {
      setLoading(true);
      let reviews;

      if (selectedFilter === '전체') {
        // If "All" is selected, try to show personalized feed first
        if (userPreferences) {
          console.log('Fetching personalized feed...');
          reviews = await getPersonalizedFeed(userPreferences, 20);

          // If personalized feed is empty (no matches), fallback to recent
          if (reviews.length === 0) {
            console.log('Personalized feed empty, falling back to recent');
            reviews = await getRecentReviews(20);
          }
        } else {
          // No preferences, show recent
          reviews = await getRecentReviews(20);
        }
      } else {
        // Map UI filter names to review tags
        const tagMap = {
          '산미있는': '산미',
          '고소한': '고소한',
          '디카페인': '디카페인',
          '핸드드립': '핸드드립',
          '라떼맛집': '라떼',
          '뷰맛집': '뷰',
        };
        const tag = tagMap[selectedFilter] || selectedFilter;
        reviews = await getReviewsByTag(tag, 20);
      }

      // Transform reviews to post format for display
      const transformedPosts = reviews.map(transformReviewToPost);

      // Use Firebase data if available, otherwise fallback to mock data
      if (transformedPosts.length > 0) {
        setPosts(transformedPosts);
      } else {
        // Fallback to MOCK_POSTS when Firebase is empty
        console.log('📝 Using mock data (Firebase is empty)');
        setPosts(MOCK_POSTS);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      // On error, fallback to mock data
      console.log('⚠️ Using mock data (Firebase error)');
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load ranking feed
   */
  const loadRanking = async () => {
    try {
      setLoading(true);
      const reviews = await getTopRatedReviews(20);
      const transformedPosts = reviews.map(transformReviewToPost);

      if (transformedPosts.length > 0) {
        setPosts(transformedPosts);
      } else {
        setPosts(MOCK_POSTS);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'ranking') {
      await loadRanking();
    } else {
      await loadPreferencesAndFeed();
    }
    setRefreshing(false);
  };

  /**
   * Transform Firebase review object to CoffeeCard post format
   */
  const transformReviewToPost = (review) => {
    // Debug: Log review data to check if cafeName and coffeeName exist
    if (!review.cafeName || !review.coffeeName) {
      // console.log('Missing cafe/coffee name in review:', review.id);
    }

    return {
      id: review.id,
      cafeName: review.cafeName || '카페 정보 없음',
      coffeeName: review.coffeeName || '커피 정보 없음',
      location: review.cafeAddress || review.location || '',
      imageUrl: review.photoUrls && review.photoUrls.length > 0 ? review.photoUrls[0] : null,
      rating: review.rating || 0,
      tags: review.basicTags || [],
      flavorProfile: review.flavorProfile || {
        acidity: review.acidity || 0,
        sweetness: review.sweetness || 0,
        body: review.body || 0,
        bitterness: review.bitterness || 0,
        aroma: review.aroma || 0,
      },
      author: {
        name: review.userDisplayName || '익명',
        avatar: review.userPhotoURL || null,
        level: 'Barista', // Default level, can be enhanced later
      },
      description: review.comment || '',
      likes: 0, // v0.2 feature
      comments: 0, // v0.2 feature
      date: formatDateRelative(review.createdAt),
      cafeId: review.cafeId,
      score: review.score, // Include matching score if available
    };
  };

  /**
   * Format Firebase timestamp to relative time string
   */
  const formatDateRelative = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 30) return `${diffDays}일 전`;

      // Format as YYYY.MM.DD for older posts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  /**
   * Request location permission and get user's current location
   */
  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);

      // Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === 'granted') {
        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(coords);

        // Load nearby cafes
        await loadNearbyCafes(coords.latitude, coords.longitude);
      } else if (status === 'denied') {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermission('denied');
    } finally {
      setLocationLoading(false);
    }
  };

  /**
   * Load cafes near user's location
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   */
  const loadNearbyCafes = async (latitude, longitude) => {
    try {
      const allCafes = await getAllCafes();

      const cafesWithCoordinates = allCafes.filter(
        cafe => cafe.coordinates &&
          ((cafe.coordinates.latitude && cafe.coordinates.longitude) ||
            (cafe.coordinates._lat && cafe.coordinates._long))
      );

      // Calculate distance and filter
      const cafesWithDistance = cafesWithCoordinates
        .map(cafe => {
          const lat = cafe.coordinates.latitude || cafe.coordinates._lat;
          const lng = cafe.coordinates.longitude || cafe.coordinates._long;

          return {
            ...cafe,
            distance: calculateDistance(
              latitude,
              longitude,
              lat,
              lng
            ),
          };
        })
        .filter(cafe => cafe.distance <= 10) // Within 10km
        .sort((a, b) => a.distance - b.distance);

      setNearbyCafes(cafesWithDistance);
    } catch (error) {
      console.error('Error loading nearby cafes:', error);
    }
  };

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in kilometers
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  /**
   * Open device settings to enable location permission
   */
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  /**
   * Handle cafe press from nearby list or map
   */
  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetail', { cafeId: cafe.id });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={[styles.greeting, { color: colors.textPrimary }]}>
        {user?.displayName ? `${user.displayName}님` : '바리스타님'} ☕️
      </Text>
      <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
        {userPreferences
          ? '취향에 딱 맞는 커피를 찾아왔어요.'
          : '오늘의 추천 커피를 확인해보세요.'}
      </Text>

      <View style={{ marginTop: 20, marginBottom: -10 }}>
        <FeaturedCarousel
          cafes={featuredCafes}
          onPress={(id) => {
            // Find the post with this ID to get cafeId if available, or just navigate
            // For mock data, we might not have real cafeId
            console.log('Featured pressed:', id);
          }}
        />
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <View style={[styles.tabsList, { backgroundColor: colors.stone100 }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'feed' && [styles.activeTab, { backgroundColor: colors.backgroundWhite }]
          ]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeTab === 'feed' && [styles.activeTabText, { color: colors.textPrimary }]
          ]}>
            피드
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'nearby' && [styles.activeTab, { backgroundColor: colors.backgroundWhite }]
          ]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text style={[
            styles.tabText,
            { color: colors.textSecondary },
            activeTab === 'nearby' && [styles.activeTabText, { color: colors.textPrimary }]
          ]}>
            내 주변
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
        <Ionicons name="options-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>필터</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterTags = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterTagsScroll}
      contentContainerStyle={styles.filterTagsContent}
    >
      {FILTER_TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[
            styles.filterTag,
            { backgroundColor: colors.backgroundWhite, borderColor: colors.border },
            selectedFilter === tag && [styles.filterTagActive, { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }]
          ]}
          onPress={() => setSelectedFilter(tag)}
        >
          <Text style={[
            styles.filterTagText,
            { color: colors.textSecondary },
            selectedFilter === tag && [styles.filterTagTextActive, { color: colors.backgroundWhite }]
          ]}>
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFeedContent = () => {
    // Show loading spinner while fetching data
    // Show loading skeleton while fetching data
    if (loading) {
      return (
        <View style={styles.feedContent}>
          {[1, 2, 3].map((key) => (
            <CoffeeCardSkeleton key={key} />
          ))}
        </View>
      );
    }

    // Render feed with pull-to-refresh
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View>
            {/* Show recommendation badge for high scoring items in Feed tab */}
            {activeTab === 'feed' && item.score && item.score >= 5 && index === 0 && (
              <View style={[styles.recommendationBadge, { backgroundColor: colors.brand + '20' }]}>
                <Ionicons name="sparkles" size={14} color={colors.brand} />
                <Text style={[styles.recommendationText, { color: colors.brand }]}>
                  취향 저격 추천!
                </Text>
              </View>
            )}

            {/* Show Ranking Badge for Ranking Tab */}
            {activeTab === 'ranking' && (
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
            )}

            <CoffeeCard
              post={item}
              index={index}
              onPress={() => {
                // Mock posts don't have cafeId, so only navigate for real posts
                if (item.cafeId) {
                  navigation.navigate('CafeDetail', { cafeId: item.cafeId });
                }
              }}
            />
          </View>
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              아직 등록된 리뷰가 없습니다.
            </Text>
          </View>
        }
      />
    );
  };

  const renderNearbyContent = () => {
    // No permission requested yet
    if (!locationPermission) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={Colors.amber300} />
          <Text style={styles.emptyStateTitle}>위치 권한이 필요합니다</Text>
          <Text style={styles.emptyStateSubtext}>
            주변 카페를 찾기 위해 위치 권한을 허용해주세요
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Ionicons name="location" size={16} color={Colors.backgroundWhite} />
            <Text style={styles.permissionButtonText}>권한 허용하기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Permission denied
    if (locationPermission === 'denied') {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={Colors.stone300} />
          <Text style={styles.emptyStateTitle}>위치 권한이 거부되었습니다</Text>
          <Text style={styles.emptyStateSubtext}>
            설정에서 위치 권한을 허용해주세요
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
          >
            <Ionicons name="settings" size={16} color={Colors.stone700} />
            <Text style={styles.settingsButtonText}>설정 열기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Loading location
    if (locationLoading || !userLocation) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner visible={true} fullScreen={false} />
          <Text style={styles.emptyStateSubtext}>위치를 가져오는 중...</Text>
        </View>
      );
    }

    // Show map and nearby cafes list
    return (
      <View style={styles.nearbyContainer}>
        {/* Map View */}
        <View style={styles.mapSection}>
          <NaverMapView
            cafes={nearbyCafes}
            onMarkerPress={handleCafePress}
            userLocation={userLocation}
            style={styles.map}
          />
        </View>

        {/* Nearby Cafes List */}
        <View style={styles.nearbyListSection}>
          <View style={styles.nearbyListHeader}>
            <View style={styles.nearbyListTitleRow}>
              <Ionicons name="location" size={20} color={Colors.amber600} />
              <Text style={styles.nearbyListTitle}>
                주변 카페 ({nearbyCafes.length})
              </Text>
            </View>
            {nearbyCafes.length > 0 && (
              <Text style={styles.nearbyListSubtitle}>
                가장 가까운 카페부터 표시됩니다
              </Text>
            )}
          </View>

          {nearbyCafes.length === 0 ? (
            <View style={styles.emptyNearbyList}>
              <Ionicons name="cafe-outline" size={40} color={Colors.stone300} />
              <Text style={styles.emptyNearbyText}>
                주변 10km 이내에 카페가 없습니다
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.nearbyList}
              showsVerticalScrollIndicator={false}
            >
              {nearbyCafes.map((cafe) => (
                <TouchableOpacity
                  key={cafe.id}
                  style={[styles.cafeListItem, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}
                  onPress={() => handleCafePress(cafe)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cafeListItemContent}>
                    <View style={[styles.cafeListItemIcon, { backgroundColor: colors.stone100 }]}>
                      <Ionicons name="cafe" size={20} color={colors.textSecondary} />
                    </View>
                    <View style={styles.cafeListItemText}>
                      <Text style={[styles.cafeName, { color: colors.textPrimary }]}>{cafe.name}</Text>
                      <Text style={[styles.cafeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                        {cafe.address || '주소 정보 없음'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cafeListItemRight}>
                    <Text style={[styles.cafeDistance, { color: colors.brand }]}>
                      {cafe.distance < 1
                        ? `${Math.round(cafe.distance * 1000)}m`
                        : `${cafe.distance.toFixed(1)}km`}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  const renderRankingContent = () => {
    return renderFeedContent();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <>
            {renderFilterTags()}
            {renderFeedContent()}
          </>
        );
      case 'nearby':
        return renderNearbyContent();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {renderHeader()}
        {renderTabs()}
        {renderTabContent()}

        {/* Recommendation Widget (Bottom) - Only show if we have preferences */}
        {activeTab === 'feed' && userPreferences && (
          <View style={[styles.recommendationWidget, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}>
            <Text style={[styles.recommendationLabel, { color: colors.textSecondary }]}>오늘의 커피 취향</Text>
            <Text style={[styles.recommendationText, { color: colors.textPrimary }]}>
              {userPreferences.roast === 'dark' ? '진하고 묵직한 다크 로스트' :
                userPreferences.roast === 'light' ? '화사한 산미의 라이트 로스트' : '밸런스 좋은 미디엄 로스트'} 어때요?
            </Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.stone800,
    marginBottom: 8,
  },
  rankingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  subGreeting: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: Colors.stone100,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.backgroundWhite,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.amber700,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
  },
  filterButtonText: {
    fontSize: Typography.buttonSmall.fontSize,
    fontWeight: Typography.buttonSmall.fontWeight,
    color: Colors.stone600,
  },
  filterTagsScroll: {
    marginBottom: 16,
  },
  filterTagsContent: {
    gap: 8,
    paddingBottom: 8,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.backgroundWhite,
  },
  filterTagActive: {
    backgroundColor: Colors.stone800,
    borderColor: Colors.stone800,
  },
  filterTagText: {
    fontSize: Typography.buttonSmall.fontSize,
    fontWeight: Typography.buttonSmall.fontWeight,
    color: Colors.stone600,
  },
  filterTagTextActive: {
    color: Colors.backgroundWhite,
  },
  feedContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  emptyStateText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textTertiary,
    marginTop: 12,
  },
  emptyFeedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginTop: 16,
  },
  emptyStateTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone600,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone400,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  // Permission Buttons
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.amber600,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  permissionButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.backgroundWhite,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.stone100,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.stone200,
  },
  settingsButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.stone700,
  },

  // Nearby Container
  nearbyContainer: {
    flex: 1,
  },
  mapSection: {
    height: 300,
    backgroundColor: Colors.stone100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },

  // Nearby List
  nearbyListSection: {
    flex: 1,
  },
  nearbyListHeader: {
    marginBottom: 12,
  },
  nearbyListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nearbyListTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone800,
  },
  nearbyListSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
    marginLeft: 28,
  },
  nearbyList: {
    flex: 1,
  },
  emptyNearbyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyNearbyText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone400,
    marginTop: 12,
  },
  cafeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  cafeListItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cafeListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeListItemText: {
    flex: 1,
  },
  cafeName: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
    marginBottom: 2,
  },
  cafeAddress: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
  },
  cafeListItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cafeDistance: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.amber600,
  },

  // Recommendation Widget
  recommendationWidget: {
    backgroundColor: Colors.stone50,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.stone200,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone500,
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone800,
  },
});

export default FeedHomeScreen;
