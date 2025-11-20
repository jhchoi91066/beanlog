// Cafe Detail Screen - 카페 상세 정보 및 리뷰
// 문서 참조: The Blueprint - F-1.2 카페 상세

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { Colors, Typography } from '../constants';
import { LoadingSpinner, EmptyState, Tag, StarRating } from '../components';
import { getCafeById } from '../services/cafeService';
import { getReviewsByCafe } from '../services/reviewService';

const CafeDetailScreen = ({ route }) => {
  const { cafeId } = route.params;

  const [cafe, setCafe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cafe info and reviews on component mount
  useEffect(() => {
    fetchCafeData();
  }, [cafeId]);

  /**
   * Fetch cafe information and reviews
   * Uses getCafeById() and getReviewsByCafe() from services
   */
  const fetchCafeData = async () => {
    try {
      setLoading(true);

      // Fetch cafe info and reviews in parallel
      const [cafeData, reviewsData] = await Promise.all([
        getCafeById(cafeId),
        getReviewsByCafe(cafeId),
      ]);

      setCafe(cafeData);
      setReviews(reviewsData);
    } catch (error) {
      // Firebase is not configured yet, so service calls will fail
      // Show empty state when error occurs
      console.log('Service call failed (expected until Firebase is configured):', error.message);
      setCafe(null);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render a single review item
   */
  const renderReviewItem = ({ item }) => {
    return (
      <View style={styles.reviewItem}>
        {/* User display name */}
        <Text style={styles.userName}>{item.displayName || '익명'}</Text>

        {/* Star rating */}
        <View style={styles.ratingContainer}>
          <StarRating rating={item.rating} readonly={true} size={16} />
        </View>

        {/* v0.2: F-PHOTO - Display photos if available */}
        {item.photoUrls && item.photoUrls.length > 0 && (
          <View style={styles.photosContainer}>
            {item.photoUrls.map((photoUrl, index) => (
              <TouchableOpacity
                key={`${item.id}-photo-${index}`}
                onPress={() => {
                  // TODO: Open full-screen image viewer
                  console.log('Open photo:', photoUrl);
                }}
              >
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Basic tags (맛 태그) */}
        {item.basicTags && item.basicTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.basicTags.map((tag, index) => (
              <Tag
                key={`${item.id}-tag-${index}`}
                label={tag}
                selected={false}
                style={styles.tag}
              />
            ))}
          </View>
        )}

        {/* Comment (한 줄 코멘트) */}
        {item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}

        {/* Divider */}
        <View style={styles.reviewDivider} />
      </View>
    );
  };

  /**
   * Render cafe header section
   */
  const renderCafeHeader = () => {
    if (!cafe) return null;

    return (
      <View style={styles.cafeHeader}>
        {/* Cafe name */}
        <Text style={styles.cafeName}>{cafe.name}</Text>

        {/* Address */}
        {cafe.address && (
          <Text style={styles.cafeAddress}>{cafe.address}</Text>
        )}

        {/* Location tags */}
        {cafe.locationTags && cafe.locationTags.length > 0 && (
          <View style={styles.locationTagsContainer}>
            {cafe.locationTags.map((tag, index) => (
              <Tag
                key={`location-${index}`}
                label={tag}
                selected={false}
                style={styles.locationTag}
              />
            ))}
          </View>
        )}

        {/* Section divider */}
        <View style={styles.sectionDivider} />
      </View>
    );
  };

  /**
   * Render reviews section header
   */
  const renderReviewsHeader = () => {
    return (
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>
          리뷰 {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
      </View>
    );
  };

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner visible={true} fullScreen={false} />;
  }

  // Show error state if cafe data failed to load
  if (!cafe) {
    return (
      <View style={styles.container}>
        <EmptyState message="카페 정보를 불러올 수 없습니다" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {renderCafeHeader()}
            {renderReviewsHeader()}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyReviews}>
            <EmptyState message="아직 리뷰가 없습니다" />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  // Cafe header section
  cafeHeader: {
    padding: 20,
    backgroundColor: Colors.background,
  },
  cafeName: {
    ...Typography.h1,
    color: Colors.brand,
    marginBottom: 8,
  },
  cafeAddress: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  locationTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  locationTag: {
    marginRight: 6,
    marginBottom: 6,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: Colors.divider,
    marginTop: 16,
    marginHorizontal: -20, // Extend to screen edges
  },
  // Reviews section
  reviewsHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  reviewsTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  // Review item
  reviewItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  // v0.2: F-PHOTO - Photo display styles
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.divider,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    marginRight: 6,
    marginBottom: 6,
  },
  comment: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginTop: 16,
  },
  // Empty reviews state
  emptyReviews: {
    flex: 1,
    minHeight: 300,
  },
});

CafeDetailScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

export default CafeDetailScreen;
