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
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../constants';
import { LoadingSpinner, EmptyState, Tag, StarRating, MiniMap } from '../components';
import AnimatedHeart from '../components/AnimatedHeart';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCafeById, toggleCafeBookmark } from '../services/cafeService';
import { getReviewsByCafe } from '../services/reviewService';
import { searchNaverImages } from '../services/naverSearchService';

const CafeDetailScreen = ({ route, navigation }) => {
  const { cafeId } = route.params;
  const { colors } = useTheme();

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
        <View style={{ marginRight: 16 }}>
          <AnimatedHeart
            isLiked={isBookmarked}
            onToggle={handleBookmark}
            size={24}
          />
        </View>
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

      // Check if cafe data was passed via params (especially for Naver results)
      const passedCafe = route.params?.cafe;
      const isNaverResult = cafeId?.startsWith('naver_');

      let cafeData = null;
      let reviewsData = [];

      if (isNaverResult && passedCafe) {
        // Use passed data for Naver results and skip Firestore for cafe info
        cafeData = passedCafe;
        // reviewsData will remain empty for Naver results
      } else {
        // Fetch cafe info and reviews in parallel for DB cafes
        const [fetchedCafe, fetchedReviews] = await Promise.all([
          getCafeById(cafeId).catch(() => null), // Catch "not found" or other errors
          getReviewsByCafe(cafeId).catch(() => []),
        ]);
        cafeData = fetchedCafe || passedCafe; // Fallback to passedCafe if DB fetch fails
        reviewsData = fetchedReviews;
      }

      setCafe(cafeData);
      setReviews(reviewsData);

      // Check if bookmarked
      if (user && cafeData) {
        const bookmarkedBy = cafeData.bookmarkedBy || [];
        setIsBookmarked(bookmarkedBy.includes(user.uid));
      }

      // v0.3: F-ENHANCED - Fetch image from Naver if missing
      if (cafeData && !cafeData.thumbnailUrl) {
        // Check if there are reviews with photos
        const hasReviewPhotos = reviewsData.some(r => r.photoUrls && r.photoUrls.length > 0);

        if (!hasReviewPhotos) {
          // Use placeholder logic
          const { getCafePlaceholderImage } = require('../utils/imageUtils');
          const placeholder = getCafePlaceholderImage([], cafeData.name);
          setCafe(prev => ({ ...prev, thumbnailUrl: placeholder }));
        } else {
          // Use the first review photo as thumbnail
          const firstReviewWithPhoto = reviewsData.find(r => r.photoUrls && r.photoUrls.length > 0);
          if (firstReviewWithPhoto) {
            setCafe(prev => ({ ...prev, thumbnailUrl: firstReviewWithPhoto.photoUrls[0] }));
          }
        }
      }

      // v0.4: F-DETAIL - Fetch missing info (Phone, Link) from Naver Place
      if (cafeData && (!cafeData.phoneNumber || !cafeData.naverLink)) {
        try {
          const { searchNaverPlaces } = require('../services/naverSearchService');
          const naverResults = await searchNaverPlaces(cafeData.name);

          // Find matching result by address
          const match = naverResults.find(result => {
            const addr1 = (cafeData.address || '').replace(/\s/g, '');
            const addr2 = (result.address || '').replace(/\s/g, '');
            return addr1.includes(addr2) || addr2.includes(addr1);
          });

          if (match) {
            setCafe(prev => ({
              ...prev,
              phoneNumber: prev.phoneNumber || match.telephone,
              naverLink: prev.naverLink || match.link,
              description: prev.description || match.description,
            }));
          }
        } catch (err) {
          console.log('Failed to fetch Naver Place info:', err);
        }
      }
    } catch (error) {
      console.log('fetchCafeData error:', error.message);
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
      <View style={[styles.reviewItem, { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 }]}>
        {/* User display name */}
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{item.displayName || '익명'}</Text>

        {/* Star rating */}
        <View style={styles.ratingContainer}>
          <StarRating rating={item.rating} readonly={true} size={16} />
        </View>

        {/* v0.2: F-PHOTO - Display photos if available, otherwise show default */}
        <View style={styles.photosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScrollContent}>
            {(item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : ['https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop']).map((photoUrl, index) => (
              <TouchableOpacity
                key={`${item.id}-photo-${index}`}
                onPress={() => {
                  // Full-screen image viewer will be implemented in future version
                }}
              >
                <Image
                  source={{ uri: photoUrl }}
                  style={[styles.photoThumbnail, { backgroundColor: colors.stone200 }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        {/* Comment (한 줄 코멘트) */}
        {item.comment && (
          <Text style={[styles.comment, { color: colors.stone600 }]}>{item.comment}</Text>
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
  // Animation value for parallax effect
  const scrollY = new Animated.Value(0);

  // Parallax header styles
  const headerHeight = 300;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-headerHeight, 0, headerHeight],
    outputRange: [headerHeight / 2, 0, -headerHeight / 2],
    extrapolate: 'clamp',
  });
  const headerScale = scrollY.interpolate({
    inputRange: [-headerHeight, 0, headerHeight],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });

  /**
   * Render cafe header section
   * v0.3: F-ENHANCED - Improved hero section and added MiniMap
   */
  const renderCafeHeader = () => {
    if (!cafe) return null;

    return (
      <View style={[styles.cafeHeader, { backgroundColor: colors.backgroundWhite, borderBottomColor: colors.stone100 }]}>
        {/* Hero image - Cafe thumbnail with Gradient Overlay */}
        <View style={styles.heroContainer}>
          <Animated.View
            style={[
              styles.heroImageContainer,
              {
                transform: [{ translateY: headerTranslateY }, { scale: headerScale }],
              },
            ]}
          >
            {cafe.thumbnailUrl ? (
              <Image
                source={{ uri: cafe.thumbnailUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImage, { backgroundColor: colors.stone200 }]} />
            )}
          </Animated.View>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          >
            <Text style={styles.heroCafeName}>{cafe.name}</Text>
            {cafe.address && (
              <Text style={styles.heroCafeAddress} numberOfLines={1}>
                {cafe.address}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Content Container (White background to cover parallax image when scrolling up) */}
        <View style={{ backgroundColor: colors.backgroundWhite, paddingTop: 20 }}>
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

          {/* MiniMap Section */}
          <View style={styles.mapSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>위치</Text>
            <MiniMap
              coordinate={(() => {
                if (cafe.mapx && cafe.mapy) {
                  return {
                    latitude: parseFloat(cafe.mapy) > 900 ? parseFloat(cafe.mapy) / 10000000 : parseFloat(cafe.mapy),
                    longitude: parseFloat(cafe.mapx) > 200 ? parseFloat(cafe.mapx) / 10000000 : parseFloat(cafe.mapx)
                  };
                } else if (cafe.coordinates) {
                  // Handle Firestore GeoPoint or object
                  const lat = cafe.coordinates.latitude || cafe.coordinates._lat;
                  const lng = cafe.coordinates.longitude || cafe.coordinates._long;
                  if (lat && lng) return { latitude: lat, longitude: lng };
                } else if (cafe.latitude && cafe.longitude) {
                  return { latitude: cafe.latitude, longitude: cafe.longitude };
                }
                return null;
              })()}
              cafeName={cafe.name}
              address={cafe.address}
            />
          </View>

          {/* v0.2: F-ENHANCED - Enhanced cafe information */}
          <View style={styles.enhancedInfoSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>정보</Text>

            {/* Phone number */}
            {cafe.phoneNumber && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Linking.openURL(`tel:${cafe.phoneNumber}`)}
              >
                <Ionicons name="call-outline" size={20} color={Colors.brand} />
                <Text style={[styles.infoText, { color: colors.stone600 }]}>{cafe.phoneNumber}</Text>
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
                <Text style={[styles.infoText, styles.instagramText, { color: Colors.amber600 }]}>{cafe.instagramHandle}</Text>
              </TouchableOpacity>
            )}

            {/* Parking info */}
            {cafe.parkingInfo && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={20} color={Colors.brand} />
                <Text style={[styles.infoText, { color: colors.stone600 }]}>{cafe.parkingInfo}</Text>
              </View>
            )}

            {/* Closed days */}
            {cafe.closedDays && cafe.closedDays.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.stone400} />
                <Text style={[styles.infoText, { color: colors.stone600 }]}>휴무일: {cafe.closedDays.join(', ')}</Text>
              </View>
            )}

            {/* Naver Place Link */}
            {cafe.naverLink && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Linking.openURL(cafe.naverLink)}
              >
                <View style={{ width: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#03C75A' }}>N</Text>
                </View>
                <Text style={[styles.infoText, { color: colors.stone600, textDecorationLine: 'underline' }]}>상세 정보 보기</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section divider */}
          <View style={[styles.sectionDivider, { backgroundColor: colors.stone100 }]} />
        </View>
      </View>
    );
  };

  /**
   * Render reviews section header
   */
  const renderReviewsHeader = () => {
    return (
      <View style={[styles.reviewsHeader, { backgroundColor: colors.backgroundWhite }]}>
        <Text style={[styles.reviewsTitle, { color: colors.textPrimary }]}>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          message="카페 정보를 불러올 수 없습니다"
          icon={<Ionicons name="alert-circle-outline" size={48} color={Colors.stone300} />}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.FlatList
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
          <View style={[styles.emptyReviews, { backgroundColor: colors.backgroundWhite }]}>
            <EmptyState
              message="아직 리뷰가 없습니다"
              icon={<Ionicons name="chatbubble-outline" size={48} color={Colors.stone300} />}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
    // paddingBottom: 20, // Removed padding to allow content to sit flush
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  heroContainer: {
    width: '100%',
    height: 300,
    marginBottom: 0, // Removed margin
    position: 'relative',
    overflow: 'hidden', // Ensure image doesn't bleed out
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 20,
    zIndex: 1, // Ensure text is above image
  },
  heroCafeName: {
    ...Typography.h1,
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroCafeAddress: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  locationTag: {
    marginRight: 0,
    marginBottom: 0,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.stone800,
    marginBottom: 12,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  // v0.2: F-ENHANCED - Enhanced info section
  enhancedInfoSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
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
    marginTop: 24,
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
    padding: 20,
    backgroundColor: Colors.backgroundWhite,
    marginBottom: 12,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone200,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
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
    marginBottom: 12,
  },
  photosScrollContent: {
    gap: 8,
    paddingRight: 20, // Add padding for last item
  },
  photoThumbnail: {
    width: 120, // Larger thumbnail
    height: 120,
    borderRadius: 8,
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
    display: 'none', // Hide divider since we use cards now
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
