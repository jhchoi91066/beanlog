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
import { LoadingSpinner, EmptyState, Tag, NaverMapView } from '../components';
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
    } catch (error) {
      // Firebase is not configured yet, so service calls will fail
      // Show empty state when error occurs
      console.log('Service call failed (expected until Firebase is configured):', error.message);
      setCafes([]);
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
    // Show first 2 location tags
    const displayLocationTags = item.locationTags ? item.locationTags.slice(0, 2) : [];

    return (
      <TouchableOpacity
        style={styles.cafeItem}
        onPress={() => handleCafePress(item.id)}
        activeOpacity={0.7}
      >
        {/* Cafe thumbnail image */}
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.cafeThumbnail}
          resizeMode="cover"
        />

        {/* Cafe info */}
        <View style={styles.cafeInfo}>
          <Text style={styles.cafeName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Location tags */}
          {displayLocationTags.length > 0 && (
            <View style={styles.locationTagsContainer}>
              {displayLocationTags.map((tag, index) => (
                <Tag
                  key={`${item.id}-location-${index}`}
                  label={tag}
                  selected={false}
                  style={styles.locationTag}
                />
              ))}
            </View>
          )}

          {/* Rating - placeholder until we calculate from reviews */}
          <Text style={styles.rating}>평점 준비중</Text>
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
        {cafes.length === 0 ? (
          <EmptyState message="등록된 카페가 없습니다" />
        ) : viewMode === 'map' ? (
          // v0.2: F-MAP - Map View
          <NaverMapView
            cafes={cafes}
            onMarkerPress={handleMarkerPress}
            initialRegion={{
              latitude: 37.5665,
              longitude: 126.9780,
              zoom: 12,
            }}
          />
        ) : (
          // List View
          <FlatList
            data={cafes}
            renderItem={renderCafeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  cafeThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: Colors.divider,
  },
  cafeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cafeName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  locationTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  locationTag: {
    marginRight: 4,
    marginBottom: 4,
  },
  rating: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
