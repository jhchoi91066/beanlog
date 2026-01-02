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
  Modal,
  RefreshControl,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import { CoffeeCard, LoadingSpinner } from '../components';
import FeaturedCarousel from '../components/FeaturedCarousel';
import CollectionSection from '../components/CollectionSection';
import CoffeeCardSkeleton from '../components/CoffeeCardSkeleton';
import NaverMapView from '../components/NaverMapView';
import { getRecentReviews, getReviewsByTag, getPersonalizedFeed, getTopRatedReviews } from '../services/feedService';
import { getAllCafes, getCuratedCafes } from '../services/cafeService';
import { getAllCollections } from '../services/collectionService';
import { useTheme } from '../contexts';
import { useAuth } from '../contexts/AuthContext';
import Shadows from '../constants/shadows';

import { MOCK_POSTS } from '../services/mockData';
import { useFeedQuery } from '../hooks/useFeedQuery';
import { useRemoteConfig } from '../hooks/useRemoteConfig';



// Filter tags for coffee preferences (matches web design)
const FILTER_TAGS = ['전체', '산미있는', '고소한', '디카페인', '핸드드립', '라떼맛집', '뷰맛집'];

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
 * Transform Firebase review object to CoffeeCard post format
 */
const transformReviewToPost = (review) => {
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
      id: review.userId,
      name: review.userDisplayName || '익명',
      avatar: review.userPhotoURL || null,
      level: review.userId?.startsWith('persona') ? 'Curator' : 'Barista',
    },
    description: review.comment || '',
    likes: review.likes || 0,
    comments: review.comments || 0,
    date: formatDateRelative(review.createdAt),
    cafeId: review.cafeId,
    score: review.score,
    isCurated: review.userId?.startsWith('persona') // Check if author is a persona
  };
};

const FeedHomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth(); // Get user for personalization
  const { showSeasonalBanner, bannerTitle, bannerText } = useRemoteConfig();
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [userPreferences, setUserPreferences] = useState(null); // Store user preferences
  const [flavorFilter, setFlavorFilter] = useState({
    acidity: 0,
    sweetness: 0,
    body: 0,
    bitterness: 0,
    aroma: 0,
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collections, setCollections] = useState([]); // Curated collections
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Query integration
  const {
    data: feedData,
    isLoading: isFeedLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFeedQuery(userPreferences, flavorFilter, activeTab === 'feed');

  // Location & Nearby cafes state
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [featuredCafes, setFeaturedCafes] = useState([]);

  // Load feed data on mount and when filter changes
  useEffect(() => {
    loadPreferencesAndCollections();
  }, []);

  // Request location when "내 주변" tab is activated
  useEffect(() => {
    if (activeTab === 'nearby' && !userLocation && locationPermission !== 'denied') {
      requestLocationPermission();
    }
  }, [activeTab]);

  /**
   * Load user preferences, collections and curated cafes
   */
  const loadPreferencesAndCollections = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      if (storedPrefs) {
        setUserPreferences(JSON.parse(storedPrefs));
      }

      // 1. Fetch collections
      const fetchedCollections = await getAllCollections();
      setCollections(fetchedCollections);

      // 2. Fetch curated cafes for the carousel (Hyper-Local Moat)
      const curatedCafesData = await getCuratedCafes();

      if (curatedCafesData.length > 0) {
        const featured = curatedCafesData.map(cafe => ({
          id: cafe.id,
          name: cafe.name,
          address: cafe.address,
          thumbnailUrl: cafe.thumbnailUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop',
          locationTags: cafe.locationTags || [],
          rating: cafe.rating || 5.0,
          isCurated: true
        }));
        setFeaturedCafes(featured);
      } else {
        // Fallback to mock if none found
        const featured = MOCK_POSTS.slice(0, 3).map(post => ({
          id: post.id,
          name: post.cafeName,
          address: post.location,
          thumbnailUrl: post.imageUrl,
          locationTags: post.tags,
          rating: post.rating
        }));
        setFeaturedCafes(featured);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  /**
   * Load community feed from Firebase
   * Applies current filter selection and personalization
   */
  // loadFeed removed - replaced by useFeedQuery

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
      setRefreshing(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    if (activeTab === 'ranking') {
      await loadRanking();
    } else {
      await refetch();
    }
  };

  // Compute posts to display
  const allPosts = (activeTab === 'feed' && feedData)
    ? feedData.pages.flatMap(page => page.reviews || []).map(transformReviewToPost)
    : [];

  const displayPosts = (activeTab === 'feed')
    ? (allPosts.length > 0 ? allPosts : MOCK_POSTS)
    : posts; // For ranking tab which still uses local state

  const isLoading = activeTab === 'feed' ? isFeedLoading : loading;

  const handleLoadMore = () => {
    if (activeTab === 'feed' && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Helpers moved outside component

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
          data={featuredCafes}
          onPressItem={(item) => {
            // Find the post with this ID to get cafeId if available, or just navigate
            // For mock data, we might not have real cafeId
            console.log('Featured pressed:', item.id);
            if (item.id) {
              // Logic to navigate to cafe detail if possible, or just log for now
            }
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

      <TouchableOpacity
        style={[
          styles.filterButton,
          { borderColor: colors.border },
          Object.values(flavorFilter).some(v => v > 0) && { backgroundColor: Colors.amber100, borderColor: Colors.amber600 }
        ]}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons
          name="options-outline"
          size={16}
          color={Object.values(flavorFilter).some(v => v > 0) ? Colors.amber600 : colors.textSecondary}
        />
        <Text style={[
          styles.filterButtonText,
          { color: Object.values(flavorFilter).some(v => v > 0) ? Colors.amber600 : colors.textSecondary }
        ]}>필터</Text>
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
    // Show loading spinner while fetching data
    // Show loading skeleton while fetching data
    if (isLoading) {
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
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View>
            {/* Show recommendation badge for high scoring items in Feed tab */}
            {activeTab === 'feed' && item.score >= 5 && index === 0 && (
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
              onCommentPress={() => {
                navigation.navigate('PostDetail', { post: item });
              }}
            />
          </View>
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        scrollEnabled={false}
        ListHeaderComponent={
          <>
            {/* Seasonal Banner (Feature Flag) */}
            {showSeasonalBanner && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.brand,
                  marginHorizontal: 20,
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...Shadows.card
                }}
                onPress={() => Alert.alert('Event', 'Winter Season Event Page')}
              >
                <View>
                  <Text style={{ ...Typography.h4, color: '#FFF', fontWeight: 'bold' }}>{bannerTitle || 'Special Event'}</Text>
                  <Text style={{ ...Typography.caption, color: '#FFF' }}>{bannerText || 'Check it out!'}</Text>
                </View>
                <Ionicons name="gift-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            )}


            {/* Curated Collections */}
            {collections.map((collection) => (
              <CollectionSection
                key={collection.id}
                collection={collection}
                navigation={navigation}
              />
            ))}


          </>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <LoadingSpinner visible={true} fullScreen={false} size="small" />
            </View>
          ) : <View style={{ height: 40 }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              아직 등록된 리뷰가 없습니다.
            </Text>
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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

            {/* Flavor Filter Modal */}
            <Modal
              visible={showFilterModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowFilterModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.backgroundWhite }]}>
                  {/* Handle Bar */}
                  <View style={{ alignItems: 'center', paddingTop: 12 }}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.stone300 }} />
                  </View>

                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>맛 상세 설정</Text>
                    <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                      원하는 커피 스타일을 설정해주세요 (최소값)
                    </Text>

                    {Object.keys(flavorFilter).map((flavor) => (
                      <View key={flavor} style={styles.sliderContainer}>
                        <View style={styles.sliderLabelRow}>
                          <Text style={[styles.sliderLabel, { color: colors.textPrimary }]}>
                            {flavor === 'acidity' ? '산미 (Acidity)' :
                              flavor === 'sweetness' ? '단맛 (Sweetness)' :
                                flavor === 'body' ? '바디감 (Body)' :
                                  flavor === 'bitterness' ? '쓴맛 (Bitterness)' :
                                    '향 (Aroma)'}
                          </Text>
                          <Text style={[styles.sliderValue, { color: Colors.brand }]}>
                            {flavorFilter[flavor] > 0 ? `${flavorFilter[flavor]}점 이상` : '전체'}
                          </Text>
                        </View>
                        <Slider
                          style={{ width: '100%', height: 40 }}
                          minimumValue={0}
                          maximumValue={5}
                          step={1}
                          value={flavorFilter[flavor]}
                          onValueChange={(val) => setFlavorFilter(prev => ({ ...prev, [flavor]: val }))}
                          minimumTrackTintColor={Colors.brand}
                          maximumTrackTintColor={colors.stone200}
                          thumbTintColor={Colors.brand}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                          <Text style={{ fontSize: 10, color: colors.textTertiary }}>0</Text>
                          <Text style={{ fontSize: 10, color: colors.textTertiary }}>5</Text>
                        </View>
                      </View>
                    ))}
                    <View style={{ height: 20 }} />
                  </ScrollView>

                  <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.resetButton, { borderColor: colors.border }]}
                      onPress={() => {
                        setFlavorFilter({ acidity: 0, sweetness: 0, body: 0, bitterness: 0, aroma: 0 });
                      }}
                    >
                      <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>초기화</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: Colors.brand }]}
                      onPress={() => {
                        setShowFilterModal(false);
                        loadFeed(); // Reload feed with new filter
                      }}
                    >
                      <Text style={styles.applyButtonText}>적용하기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
    ...Typography.h3,
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
    ...Typography.button,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  modalTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: Typography.body.fontSize,
    marginBottom: 24,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FeedHomeScreen;
