// BeanLog - Search Screen
// Converted from BeanLog_design/src/components/search/SearchPage.tsx
// Features: Search input, recent searches, trending tags, map view toggle

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import {
  searchCafes,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches as clearRecentSearchesService,
  getTrendingKeywords,
} from '../services/searchService';
import { getAllCafes } from '../services/cafeService';
import NaverMapView from '../components/NaverMapView';
import { useTheme } from '../contexts';

const { width, height } = Dimensions.get('window');

const SearchScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchText, setSearchText] = useState('');
  const [cafes, setCafes] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle prefilled search from navigation params (e.g., from ExploreScreen)
  useEffect(() => {
    if (route?.params?.prefilledSearch) {
      setSearchText(route.params.prefilledSearch);
      // Auto-search after setting text
      setTimeout(() => {
        handleSearch(route.params.prefilledSearch);
      }, 100);
    }
  }, [route?.params?.prefilledSearch]);

  // Reset state on tab press
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Reset state when tab is pressed
      clearSearch();
    });
    return unsubscribe;
  }, [navigation]);

  /**
   * Load initial data: all cafes, recent searches, trending keywords
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [allCafes, recent, trending] = await Promise.all([
        getAllCafes(),
        getRecentSearches(),
        getTrendingKeywords(),
      ]);

      setCafes(allCafes);
      setRecentSearches(recent);
      setTrendingKeywords(trending);
    } catch (error) {
      console.error('Error loading search data:', error);
      // Set default trending keywords on error
      setTrendingKeywords(['산미', '고소한', '달콤한', '라떼', '핸드드립']);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearched(false);
    // Reset to all cafes
    loadInitialData();
  };

  const clearRecentSearchesHandler = async () => {
    try {
      await clearRecentSearchesService();
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  /**
   * Perform search with current search text
   * @param {string} customText - Optional custom search text (used for auto-search)
   */
  const handleSearch = async (customText) => {
    const textToSearch = customText || searchText;
    if (!textToSearch.trim()) return;

    try {
      setLoading(true);
      setSearched(true);

      const results = await searchCafes(textToSearch);
      setCafes(results);

      // Save to recent searches
      await addRecentSearch(textToSearch);
      const updated = await getRecentSearches();
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch();
  };

  const handleRecentSearchPress = (term) => {
    setSearchText(term);
    handleSearch(term);
  };

  const handleTrendingPress = (keyword) => {
    // Remove # if present
    const cleanKeyword = keyword.replace('#', '');
    setSearchText(cleanKeyword);
    handleSearch(cleanKeyword);
  };

  const handleMapSearch = () => {
    // Refresh search with current query
    if (searchText.trim()) {
      handleSearch();
    }
  };

  const handleCafePress = (cafe) => {
    navigation.navigate('CafeDetail', { cafeId: cafe.id });
  };

  // Render map view with real cafe data
  const renderMapView = () => {
    // Filter cafes that have coordinates
    const cafesWithCoordinates = cafes.filter(cafe => {
      // Check for mapx/mapy (Naver format)
      if (cafe.mapx && cafe.mapy) return true;

      // Check for coordinates object (Firestore GeoPoint or custom object)
      if (cafe.coordinates &&
        ((cafe.coordinates.latitude && cafe.coordinates.longitude) ||
          (cafe.coordinates._lat && cafe.coordinates._long))) {
        return true;
      }

      // Check for direct latitude/longitude
      if (cafe.latitude && cafe.longitude) return true;

      return false;
    });

    return (
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.amber600} />
            <Text style={styles.loadingText}>카페 검색 중...</Text>
          </View>
        ) : (
          <>
            {/* Naver Map View */}
            <NaverMapView
              cafes={cafesWithCoordinates}
              onMarkerPress={handleCafePress}
              style={styles.map}
            />

            {/* Search this area button */}
            <View style={styles.mapSearchButtonContainer} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.mapSearchButton}
                onPress={handleMapSearch}
              >
                <Ionicons name="navigate" size={14} color={Colors.amber600} />
                <Text style={styles.mapSearchButtonText}>이 지역 재검색</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom info card */}
            <View style={[styles.mapInfoCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}>
              <View style={styles.mapInfoCardContent}>
                <View style={styles.mapInfoIcon}>
                  <Ionicons name="location" size={20} color={Colors.amber600} />
                </View>
                <View style={styles.mapInfoText}>
                  <Text style={[styles.mapInfoTitle, { color: colors.textPrimary }]}>
                    {searchText ? `"${searchText}" 검색 결과` : '카페 지도'}
                  </Text>
                  <Text style={[styles.mapInfoSubtitle, { color: colors.textSecondary }]}>
                    현재 지도에 {cafesWithCoordinates.length}개의 카페가 있어요
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.mapInfoButton, { backgroundColor: colors.textPrimary }]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[styles.mapInfoButtonText, { color: colors.backgroundWhite }]}>목록보기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  // Render cafe result item
  const renderCafeItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.cafeResultItem, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}
      onPress={() => handleCafePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cafeResultContent}>
        <View style={[styles.cafeResultIcon, { backgroundColor: colors.stone100 }]}>
          <Ionicons name="cafe" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.cafeResultText}>
          <Text style={[styles.cafeResultName, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.cafeResultAddress, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.address || '주소 정보 없음'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  // Render list view
  const renderListView = () => {
    // Show search results if user has searched
    if (searched) {
      return (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.amber600} />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : (
            <>
              {/* Results header */}
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {cafes.length > 0
                    ? `"${searchText}" 검색 결과 (${cafes.length}개)`
                    : '검색 결과가 없습니다'}
                </Text>
                {cafes.length > 0 && (
                  <TouchableOpacity
                    style={styles.mapViewButton}
                    onPress={() => setViewMode('map')}
                  >
                    <Ionicons name="map" size={16} color={Colors.amber600} />
                    <Text style={styles.mapViewButtonText}>지도</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Results list */}
              {cafes.length > 0 ? (
                <FlatList
                  data={cafes}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCafeItem}
                  contentContainerStyle={styles.resultsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyResults}>
                  <Ionicons name="search-outline" size={48} color={Colors.stone300} />
                  <Text style={styles.emptyResultsText}>
                    "{searchText}"에 대한 검색 결과가 없습니다
                  </Text>
                  <Text style={styles.emptyResultsSubtext}>
                    다른 키워드로 검색해보세요
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      );
    }

    // Show default search page (recent searches, trending, etc.)
    return (
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Map Search Banner */}
        <TouchableOpacity
          style={styles.mapBanner}
          onPress={() => {
            setViewMode('map');
            setSearched(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.stone900, Colors.stone800]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mapBannerGradient}
          >
            <View style={styles.mapBannerContent}>
              <View style={styles.mapBannerTextContainer}>
                <View style={styles.mapBannerTitleRow}>
                  <Ionicons name="map" size={20} color={Colors.amber400} />
                  <Text style={styles.mapBannerTitle}>지도로 카페 찾기</Text>
                </View>
                <Text style={styles.mapBannerSubtitle}>
                  내 주변의 맛있는 카페를 지도에서 확인해보세요
                </Text>
              </View>
              <View style={styles.mapBannerIcon}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={Colors.backgroundWhite}
                />
              </View>
            </View>
            {/* Decorative background icon */}
            <View style={styles.mapBannerDecor}>
              <Ionicons
                name="map-outline"
                size={120}
                color="rgba(255, 255, 255, 0.05)"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="time" size={16} color={Colors.amber600} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>최근 검색어</Text>
              </View>
              <TouchableOpacity onPress={clearRecentSearchesHandler}>
                <Text style={[styles.clearButton, { color: colors.textTertiary }]}>지우기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {recentSearches.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.stone100 }]}
                  onPress={() => handleRecentSearchPress(term)}
                >
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Trending Keywords */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={16} color="#EF4444" />
              <Text style={styles.sectionTitle}>실시간 인기 태그</Text>
            </View>
          </View>
          <View style={styles.trendingList}>
            {trendingKeywords.map((keyword, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingItem}
                onPress={() => handleTrendingPress(keyword)}
              >
                <View style={styles.trendingItemLeft}>
                  <Text
                    style={[
                      styles.trendingRank,
                      { color: index < 3 ? colors.brand : colors.textTertiary },
                      index < 3 && styles.trendingRankTop,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text style={[styles.trendingKeyword, { color: colors.textPrimary }]}>#{keyword}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundWhite }]}>
      {/* Search Header - Sticky */}
      <View style={[styles.searchHeader, { backgroundColor: colors.backgroundWhite, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.stone50 }]}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder={
              viewMode === 'map' ? '지도에서 지역 검색' : '검색어를 입력하세요'
            }
            placeholderTextColor={colors.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoFocus={viewMode === 'list'}
          />
          {viewMode === 'list' && (searchText.length > 0 || searched) && (
            <TouchableOpacity
              style={styles.clearIconContainer}
              onPress={clearSearch}
            >
              <Ionicons name="close" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Toggle Buttons */}
        <View style={[styles.viewToggle, { backgroundColor: colors.stone100 }]}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'list' && [styles.viewButtonActive, { backgroundColor: colors.backgroundWhite }]
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? Colors.amber600 : colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'map' && [styles.viewButtonActive, { backgroundColor: colors.backgroundWhite }]
            ]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={20} color={viewMode === 'map' ? Colors.amber600 : colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      {viewMode === 'map' ? renderMapView() : renderListView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite, // Will be overridden by inline style if needed, but keeping for safety
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.stone50,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.stone800,
    paddingVertical: 0, // Remove default padding
  },
  clearIconContainer: {
    padding: 4,
  },

  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.stone100,
    borderRadius: 12,
    padding: 4,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: Colors.backgroundWhite,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Map View Styles
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.stone100,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
  },
  mapGrid: {
    flex: 1,
    backgroundColor: Colors.stone100,
    // Mock grid pattern
    opacity: 0.1,
  },
  mapSearchButtonContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mapSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundWhite,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.stone200,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapSearchButtonText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.amber600,
    borderWidth: 2,
    borderColor: Colors.backgroundWhite,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pinLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pinLabelText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
  },
  mapInfoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.stone100,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mapInfoCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapInfoText: {
    flex: 1,
  },
  mapInfoTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
    marginBottom: 2,
  },
  mapInfoSubtitle: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },
  mapInfoButton: {
    backgroundColor: Colors.stone900,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapInfoButtonText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.backgroundWhite,
  },

  // List View Styles
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 24,
  },
  mapBanner: {
    position: 'relative',
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  mapBannerGradient: {
    padding: 20,
  },
  mapBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  mapBannerTextContainer: {
    flex: 1,
  },
  mapBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  mapBannerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.backgroundWhite,
  },
  mapBannerSubtitle: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone300,
    lineHeight: 18,
  },
  mapBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBannerDecor: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    transform: [{ rotate: '12deg' }],
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clearButton: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone400,
  },

  // Tags Container
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.stone100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone600,
  },

  // Trending List
  trendingList: {
    gap: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trendingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trendingRank: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone400,
    width: 16,
    textAlign: 'center',
  },
  trendingRankTop: {
    color: Colors.amber600,
  },
  trendingKeyword: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone700,
  },
  trendingIndicator: {
    width: 48,
    height: 32,
    backgroundColor: Colors.stone100,
    borderRadius: 8,
  },

  // Search Results Styles
  resultsContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  resultsTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone800,
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.amber200,
    borderRadius: 8,
    backgroundColor: Colors.amber50,
  },
  mapViewButtonText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.amber700,
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  cafeResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  cafeResultContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cafeResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeResultText: {
    flex: 1,
  },
  cafeResultName: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
    marginBottom: 4,
  },
  cafeResultAddress: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyResultsText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone600,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyResultsSubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone400,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
});

export default SearchScreen;
