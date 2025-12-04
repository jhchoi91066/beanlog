// Home Screen - 카페 리스트 (홈 탭)
// 문서 참조: The Blueprint - F-1.1 카페 리스트

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';
import { LoadingSpinner, EmptyState, Tag, NaverMapView, FeaturedCarousel } from '../components';
import { getAllCafes, getCafesByLocation } from '../services/cafeService';

// Available location filters from The Blueprint
const LOCATION_FILTERS = [
  { id: 'all', label: '전체' },
  { id: '성수', label: '성수' },
  { id: '연남', label: '연남' },
  { id: '강남', label: '강남' },
];

const HomeScreen = ({ navigation }) => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredCafes, setFeaturedCafes] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');

  // v0.2: F-MAP - Map/List view toggle
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedCafe, setSelectedCafe] = useState(null); // For bottom sheet
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Fetch cafes on component mount and when filter changes
  useEffect(() => {
    fetchCafes();
  }, [selectedLocation]);

  /**
   * Fetch cafes based on selected location filter
   * Uses getAllCafes() for "전체" or getCafesByLocation() for specific locations
   */
  const fetchCafes = async () => {
    try {
      setLoading(true);

      let data;
      if (selectedLocation === 'all') {
        data = await getAllCafes();
      } else {
        data = await getCafesByLocation(selectedLocation);
      }

      setCafes(data);
      console.log('Fetched cafes count:', data.length);

      // Select 3 random cafes for featured section if in 'all' mode
      if (selectedLocation === 'all') {
        let candidates = data;
        if (data.length === 0) {
          // Mock data for debugging
          candidates = [
            { id: 'm1', name: 'Mock Cafe 1', address: 'Seoul', thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
            { id: 'm2', name: 'Mock Cafe 2', address: 'Busan', thumbnailUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf' },
            { id: 'm3', name: 'Mock Cafe 3', address: 'Jeju', thumbnailUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348' }
          ];
        }

        const shuffled = [...candidates].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 3);
        console.log('Setting featured cafes:', featured.length);
        setFeaturedCafes(featured);
      } else {
        console.log('Clearing featured cafes (location not all or no data)');
        setFeaturedCafes([]);
      }
    } catch (error) {
      // Firebase is not configured yet, so service calls will fail
      // Show empty state when error occurs
      console.log('Service call failed (expected until Firebase is configured):', error.message);
      setCafes([]);

      // Fallback: Set mock featured cafes even if service fails
      if (selectedLocation === 'all') {
        const mockFeatured = [
          { id: 'm1', name: 'Mock Cafe 1', address: 'Seoul', thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
          { id: 'm2', name: 'Mock Cafe 2', address: 'Busan', thumbnailUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf' },
          { id: 'm3', name: 'Mock Cafe 3', address: 'Jeju', thumbnailUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348' }
        ];
        setFeaturedCafes(mockFeatured);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle location filter button press
   */
  const handleLocationFilter = (locationId) => {
    setSelectedLocation(locationId);
  };

  /**
   * Navigate to cafe detail screen
   */
  const handleCafePress = (cafeId) => {
    navigation.navigate('CafeDetail', { cafeId });
  };

  /**
   * v0.2: F-MAP - Handle map marker press
   */
  const handleMarkerPress = (cafe) => {
    setSelectedCafe(cafe);
    setShowBottomSheet(true);
  };

  /**
   * v0.2: F-MAP - Close bottom sheet and navigate to cafe detail
   */
  const handleBottomSheetCafePress = () => {
    if (selectedCafe) {
      setShowBottomSheet(false);
      navigation.navigate('CafeDetail', { cafeId: selectedCafe.id });
    }
  };

  /**
   * Render a single cafe list item
   */
  const renderCafeItem = ({ item }) => {
    // Debug: Check cafe data
    console.log('Cafe item:', item.name, item);

    // Show first 3 location tags
    const displayLocationTags = item.locationTags ? item.locationTags.slice(0, 3) : [];
    // Get location display (second location tag for district, fallback to first)
    const locationDisplay = item.locationTags && item.locationTags.length > 1
      ? item.locationTags[1] // Use district (성수, 강남, etc.)
      : item.locationTags && item.locationTags.length > 0
        ? item.locationTags[0]
        : '';

    return (
      <TouchableOpacity
        style={styles.cafeItem}
        onPress={() => handleCafePress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cafeCardContent}>
          {/* Cafe thumbnail image */}
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.cafeThumbnail}
            resizeMode="cover"
          />

          {/* Cafe info */}
          <View style={styles.cafeInfo}>
            {/* Header: Name and Bookmark */}
            <View style={styles.cafeHeader}>
              <View style={styles.cafeTitleRow}>
                <Text style={styles.cafeName} numberOfLines={1}>
                  {item.name || '카페'}
                </Text>
                {/* Location row */}
                {locationDisplay && (
                  <View style={styles.cafeLocationRow}>
                    <Ionicons name="location-sharp" size={12} color={Colors.stone400} />
                    <Text style={styles.cafeLocation}>{locationDisplay}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={20} color={Colors.stone400} />
              </TouchableOpacity>
            </View>

            {/* Rating row */}
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.amber400} />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewText}>(준비중)</Text>
            </View>

            {/* Location tags */}
            {displayLocationTags.length > 0 && (
              <View style={styles.tagsRow}>
                {displayLocationTags.map((tag, index) => (
                  <View key={`${item.id}-tag-${index}`} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render location filter buttons
   */
  const renderLocationFilters = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        {LOCATION_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedLocation === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => handleLocationFilter(filter.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedLocation === filter.id && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner visible={true} fullScreen={false} />;
  }

  return (
    <View style={styles.container}>
      {/* Location filter buttons - Fixed at top */}
      <View style={styles.filterWrapper}>
        {renderLocationFilters()}
      </View>

      {/* v0.2: F-MAP - View mode toggle button */}
      <TouchableOpacity
        style={styles.viewToggleButton}
        onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
      >
        <Ionicons
          name={viewMode === 'list' ? 'map' : 'list'}
          size={24}
          color={Colors.background}
        />
      </TouchableOpacity>

      {/* Cafe list or map view */}
      <View style={styles.listWrapper}>
        {viewMode === 'map' ? (
          cafes.length === 0 ? (
            <EmptyState message="등록된 카페가 없습니다" />
          ) : (
            <NaverMapView
              cafes={cafes}
              onMarkerPress={handleMarkerPress}
              initialRegion={{
                latitude: 37.5665,
                longitude: 126.9780,
                zoom: 12,
              }}
            />
          )
        ) : (
          // List View
          <FlatList
            data={cafes}
            renderItem={renderCafeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              selectedLocation === 'all' ? (
                <FeaturedCarousel
                  cafes={featuredCafes}
                  onPress={handleCafePress}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={{ marginTop: 40 }}>
                <EmptyState message="등록된 카페가 없습니다" />
              </View>
            }
          />
        )}
      </View>

      {/* v0.2: F-MAP - Bottom sheet for selected cafe */}
      <Modal
        visible={showBottomSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.bottomSheet}>
              {selectedCafe && (
                <>
                  <View style={styles.bottomSheetHandle} />
                  <TouchableOpacity
                    onPress={handleBottomSheetCafePress}
                    style={styles.bottomSheetContent}
                  >
                    <Text style={styles.bottomSheetTitle}>{selectedCafe.name}</Text>
                    <Text style={styles.bottomSheetAddress}>{selectedCafe.address}</Text>
                    {selectedCafe.locationTags && selectedCafe.locationTags.length > 0 && (
                      <View style={styles.bottomSheetTags}>
                        {selectedCafe.locationTags.slice(0, 3).map((tag, index) => (
                          <Tag
                            key={`bottom-${index}`}
                            label={tag}
                            selected={false}
                            style={styles.bottomSheetTag}
                          />
                        ))}
                      </View>
                    )}
                    <Text style={styles.bottomSheetAction}>탭하여 자세히 보기 →</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Filter wrapper - keeps filter at top
  filterWrapper: {
    zIndex: 10,
    elevation: 5,
    backgroundColor: Colors.background,
  },
  // List wrapper - prevents overlap with filter
  listWrapper: {
    flex: 1,
    zIndex: 1,
  },
  // Filter section styles
  filterScrollView: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  // List styles
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  // Cafe item styles
  cafeItem: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cafeCardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  cafeThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.stone200,
  },
  cafeInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cafeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cafeTitleRow: {
    flex: 1,
    marginRight: 8,
  },
  cafeName: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone800,
    marginBottom: 4,
  },
  cafeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cafeLocation: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: 'bold',
    color: Colors.stone800,
  },
  reviewText: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone400,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.stone100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: Colors.stone600,
  },

  // v0.2: F-MAP - View toggle button
  viewToggleButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // v0.2: F-MAP - Bottom sheet styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '40%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
  },
  bottomSheetTitle: {
    ...Typography.h1,
    color: Colors.brand,
    marginBottom: 8,
  },
  bottomSheetAddress: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  bottomSheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bottomSheetTag: {
    marginRight: 6,
    marginBottom: 6,
  },
  bottomSheetAction: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default HomeScreen;
