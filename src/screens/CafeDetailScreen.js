// Cafe Detail Screen - 카페 상세 정보 및 리뷰
// 문서 참조: The Blueprint - F-1.2 카페 상세

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';
import { LoadingSpinner, EmptyState, Tag, StarRating } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { getCafeById, toggleCafeBookmark } from '../services/cafeService';
import { getReviewsByCafe } from '../services/reviewService';
import { Alert } from 'react-native';

const CafeDetailScreen = ({ route, navigation }) => {
  const { cafeId } = route.params;

  const [cafe, setCafe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch cafe info and reviews on component mount
  useEffect(() => {
    fetchCafeData();
  }, [cafeId]);

  // Set up header bookmark button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleBookmark} style={{ marginRight: 16 }}>
          <Ionicons
            name={isBookmarked ? 'heart' : 'heart-outline'}
            size={24}
            color={isBookmarked ? Colors.error : Colors.stone800}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isBookmarked]);

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

      // Check if bookmarked
      if (user && cafeData) {
        const bookmarkedBy = cafeData.bookmarkedBy || [];
        setIsBookmarked(bookmarkedBy.includes(user.uid));
      }
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

  const handleBookmark = async () => {
    if (!user) {
      Alert.alert('로그인 필요', '북마크하려면 로그인이 필요합니다.');
      return;
    }

    try {
      // Optimistic update
      const newStatus = !isBookmarked;
      setIsBookmarked(newStatus);

      await toggleCafeBookmark(cafeId, user.uid);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setIsBookmarked(!isBookmarked);
      Alert.alert('오류', '북마크 저장에 실패했습니다.');
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

        {/* v0.2: F-PHOTO - Display photos if available, otherwise show default */}
        <View style={styles.photosContainer}>
          {(item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop']).map((photoUrl, index) => (
            <TouchableOpacity
              key={`${item.id}-photo-${index}`}
              onPress={() => {
                // Full-screen image viewer will be implemented in future version
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
   * v0.2: F-ENHANCED - Added Instagram, parking, phone, closed days
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

        {/* v0.2: F-ENHANCED - Enhanced cafe information */}
        <View style={styles.enhancedInfoSection}>
          {/* Phone number */}
          {cafe.phoneNumber && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${cafe.phoneNumber}`)}
            >
              <Ionicons name="call-outline" size={20} color={Colors.brand} />
              <Text style={styles.infoText}>{cafe.phoneNumber}</Text>
            </TouchableOpacity>
          )}

          {/* Instagram */}
          {cafe.instagramHandle && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => {
                const url = cafe.instagramUrl || `https://instagram.com/${cafe.instagramHandle.replace('@', '')}`;
                Linking.openURL(url);
              }}
            >
              <Ionicons name="logo-instagram" size={20} color={Colors.accent} />
              <Text style={[styles.infoText, styles.instagramText]}>{cafe.instagramHandle}</Text>
            </TouchableOpacity>
          )}

          {/* Parking info */}
          {cafe.parkingInfo && (
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={20} color={Colors.brand} />
              <Text style={styles.infoText}>{cafe.parkingInfo}</Text>
            </View>
          )}

          {/* Closed days */}
          {cafe.closedDays && cafe.closedDays.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
              <Text style={styles.infoText}>휴무일: {cafe.closedDays.join(', ')}</Text>
            </View>
          )}
        </View>

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
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  cafeName: {
    ...Typography.h1,
    color: Colors.stone800,
    marginBottom: 8,
  },
  cafeAddress: {
    ...Typography.body,
    color: Colors.stone600,
    marginBottom: 12,
  },
  locationTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  locationTag: {
    marginRight: 0,
    marginBottom: 0,
  },
  // v0.2: F-ENHANCED - Enhanced info section
  enhancedInfoSection: {
    marginTop: 20,
    backgroundColor: Colors.stone50,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    ...Typography.body,
    color: Colors.stone700,
    flex: 1,
  },
  instagramText: {
    color: Colors.amber600,
    fontWeight: '600',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: Colors.stone100,
    marginTop: 20,
    marginHorizontal: -20, // Extend to screen edges
  },
  // Reviews section
  reviewsHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: Colors.backgroundWhite,
  },
  reviewsTitle: {
    ...Typography.h2,
    color: Colors.stone800,
  },
  // Review item
  reviewItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundWhite,
  },
  userName: {
    ...Typography.body,
    color: Colors.stone800,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  // v0.2: F-PHOTO - Photo display styles
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.stone200,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    marginRight: 0,
    marginBottom: 0,
  },
  comment: {
    ...Typography.body,
    color: Colors.stone700,
    lineHeight: 22,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.stone200,
    marginTop: 16,
  },
  // Empty reviews state
  emptyReviews: {
    flex: 1,
    minHeight: 300,
    backgroundColor: Colors.backgroundWhite,
  },
});

CafeDetailScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

export default CafeDetailScreen;
