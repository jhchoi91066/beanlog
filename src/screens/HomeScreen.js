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
} from 'react-native';
import PropTypes from 'prop-types';
import { Colors, Typography } from '../constants';
import { LoadingSpinner, EmptyState, Tag } from '../components';
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
      {/* Location filter buttons */}
      {renderLocationFilters()}

      {/* Cafe list */}
      {cafes.length === 0 ? (
        <EmptyState message="등록된 카페가 없습니다" />
      ) : (
        <FlatList
          data={cafes}
          renderItem={renderCafeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Filter section styles
  filterScrollView: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.background,
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
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default HomeScreen;
