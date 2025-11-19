// My Page Screen - 마이페이지 (마이페이지 탭)
// 문서 참조: The Blueprint - F-3 마이페이지

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography } from '../constants';
import {
  LoadingSpinner,
  EmptyState,
  CustomButton,
  Tag,
  StarRating,
} from '../components';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByUser } from '../services/reviewService';
import { getCafeById } from '../services/cafeService';

const MyPageScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const [reviewsWithCafeInfo, setReviewsWithCafeInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalCoffees: 0,
    favoriteTag: null,
  });

  // Fetch user reviews on mount and when screen comes into focus
  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  // Refresh data when screen comes into focus (e.g., after writing a new review)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchUserReviews();
      }
    }, [user])
  );

  /**
   * Fetch user's reviews and calculate statistics
   * F-3.2: Calculate total coffees and favorite tag
   * F-3.3: Display user's review list
   */
  const fetchUserReviews = async () => {
    try {
      setLoading(true);

      // Fetch reviews by current user
      const userReviews = await getReviewsByUser(user.uid);

      // Calculate statistics
      calculateStatistics(userReviews);

      // Fetch cafe information for each review
      // Note: This is a simple v0.1 approach. In production, consider:
      // - Denormalizing cafe name in review document
      // - Using batch fetching or caching
      // - Implementing pagination for better performance
      await enrichReviewsWithCafeInfo(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Handle error gracefully - show empty state
      setReviewsWithCafeInfo([]);
      setStatistics({ totalCoffees: 0, favoriteTag: null });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enrich reviews with cafe information
   * For v0.1, we fetch cafe data for each review individually
   * @param {Array} userReviews - Array of review objects
   */
  const enrichReviewsWithCafeInfo = async (userReviews) => {
    try {
      // Fetch cafe info for each review
      const enrichedReviews = await Promise.all(
        userReviews.map(async (review) => {
          try {
            const cafe = await getCafeById(review.cafeId);
            return {
              ...review,
              cafeName: cafe.name,
              cafeAddress: cafe.address,
            };
          } catch (error) {
            // If cafe fetch fails, use cafeId as fallback
            console.error(`Failed to fetch cafe ${review.cafeId}:`, error);
            return {
              ...review,
              cafeName: `카페 ID: ${review.cafeId}`,
              cafeAddress: null,
            };
          }
        })
      );

      setReviewsWithCafeInfo(enrichedReviews);
    } catch (error) {
      console.error('Error enriching reviews:', error);
      // Fallback: use reviews without cafe info
      setReviewsWithCafeInfo(userReviews);
    }
  };

  /**
   * Calculate user statistics
   * F-3.2: Total coffees and favorite tag
   * @param {Array} userReviews - Array of review objects
   */
  const calculateStatistics = (userReviews) => {
    // Total coffees = number of reviews
    const totalCoffees = userReviews.length;

    // Calculate favorite tag (most frequently used tag)
    let favoriteTag = null;

    if (userReviews.length > 0) {
      // Count all basicTags across all reviews
      const tagCounts = {};

      userReviews.forEach((review) => {
        if (review.basicTags && Array.isArray(review.basicTags)) {
          review.basicTags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Find tag with highest count
      let maxCount = 0;
      Object.entries(tagCounts).forEach(([tag, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteTag = tag;
        }
      });
    }

    setStatistics({ totalCoffees, favoriteTag });
  };

  /**
   * Handle logout button press
   * F-3.1: Show confirmation alert before logout
   */
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('오류', '로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handle onboarding reset button press
   * Clear hasSeenOnboarding flag to see onboarding again
   */
  const handleResetOnboarding = () => {
    Alert.alert(
      '온보딩 초기화',
      '온보딩 화면을 다시 보시겠습니까? 로그아웃됩니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear onboarding flag
              await AsyncStorage.removeItem('hasSeenOnboarding');
              // Sign out user
              await signOut();
              Alert.alert('완료', '온보딩이 초기화되었습니다. 앱을 다시 시작해주세요.');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('오류', '초기화에 실패했습니다. 다시 시도해주세요.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handle review item press
   * Navigate to cafe detail page
   */
  const handleReviewPress = (review) => {
    if (review.cafeId && navigation) {
      navigation.navigate('CafeDetail', { cafeId: review.cafeId });
    }
  };

  /**
   * Format timestamp to readable date
   * @param {Object} timestamp - Firestore timestamp
   * @returns {string} Formatted date string
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '';

    try {
      // Firestore timestamp has toDate() method
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

      // Format as YYYY.MM.DD
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
   * Render user profile section
   * F-3.1: Display user info and logout button
   */
  const renderUserProfile = () => {
    return (
      <View style={styles.profileCard}>
        {/* User display name */}
        <Text style={styles.displayName}>{user?.displayName || '익명'}</Text>

        {/* User email */}
        <Text style={styles.email}>{user?.email || ''}</Text>

        {/* Logout button */}
        <CustomButton
          title="로그아웃"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />

        {/* Reset onboarding button (for testing) */}
        <CustomButton
          title="온보딩 다시 보기"
          onPress={handleResetOnboarding}
          variant="secondary"
          style={styles.resetButton}
        />
      </View>
    );
  };

  /**
   * Render statistics section
   * F-3.2: Total coffees and favorite tag
   */
  const renderStatistics = () => {
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>나의 커피 기록</Text>

        {/* Total coffees stat */}
        <View style={styles.statItem}>
          <Text style={styles.statText}>
            총 <Text style={styles.statHighlight}>{statistics.totalCoffees}</Text>잔의 커피를 마셨어요.
          </Text>
        </View>

        {/* Favorite tag stat */}
        <View style={styles.statItem}>
          {statistics.favoriteTag ? (
            <Text style={styles.statText}>
              나의 원픽 맛은 <Text style={styles.statHighlight}>#{statistics.favoriteTag}</Text>입니다.
            </Text>
          ) : (
            <Text style={styles.statText}>아직 리뷰가 없습니다</Text>
          )}
        </View>
      </View>
    );
  };

  /**
   * Render single review item
   * F-3.3: Display review with cafe name, rating, tags, comment, date
   */
  const renderReviewItem = ({ item }) => {
    return (
      <View style={styles.reviewItem}>
        {/* Cafe name */}
        <Text style={styles.cafeName} onPress={() => handleReviewPress(item)}>
          {item.cafeName || '카페 이름 없음'}
        </Text>

        {/* Star rating */}
        <View style={styles.ratingContainer}>
          <StarRating rating={item.rating} readonly={true} size={16} />
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

        {/* Created date */}
        {item.createdAt && (
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        )}

        {/* Divider */}
        <View style={styles.reviewDivider} />
      </View>
    );
  };

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner visible={true} fullScreen={false} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* F-3.1: User profile section */}
        {renderUserProfile()}

        {/* F-3.2: Statistics section */}
        {renderStatistics()}

        {/* F-3.3: Reviews section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>내가 작성한 리뷰</Text>

          {/* Reviews list */}
          {reviewsWithCafeInfo.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviewsWithCafeInfo.map((review) => (
                <View key={review.id}>
                  {renderReviewItem({ item: review })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyReviews}>
              <EmptyState message="아직 작성한 리뷰가 없습니다" />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 24,
  },

  // F-3.1: User profile card
  profileCard: {
    backgroundColor: Colors.background,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  displayName: {
    ...Typography.h1,
    color: Colors.brand,
    marginBottom: 4,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 4,
  },
  resetButton: {
    marginTop: 8,
  },

  // F-3.2: Statistics card
  statsCard: {
    backgroundColor: Colors.background,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  statsTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statItem: {
    marginBottom: 8,
  },
  statText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  statHighlight: {
    ...Typography.body,
    color: Colors.brand,
    fontWeight: 'bold',
  },

  // F-3.3: Reviews section
  reviewsSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  reviewsTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  reviewsList: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  reviewItem: {
    padding: 16,
  },
  cafeName: {
    ...Typography.h2,
    color: Colors.brand,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 8,
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
    marginBottom: 8,
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginTop: 12,
  },
  emptyReviews: {
    minHeight: 200,
  },
});

export default MyPageScreen;
