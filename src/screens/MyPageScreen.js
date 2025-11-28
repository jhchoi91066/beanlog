// BeanLog - My Page Screen (마이페이지)
// Combines ProfileScreen UI design with actual Firebase data logic
// Features: User profile, stats, flavor preferences, review management

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import CoffeeCard from '../components/CoffeeCard';
import FlavorProfile from '../components/FlavorProfile';
import { LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts';
import { getReviewsByUser, deleteReview } from '../services/reviewService';
import { getCafeById, getSavedCafes } from '../services/cafeService';

const MyPageScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'saved'
  const [reviewsWithCafeInfo, setReviewsWithCafeInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalCoffees: 0,
    favoriteTag: null,
    avgRating: 0,
  });
  const [flavorPreference, setFlavorPreference] = useState({
    acidity: 0,
    sweetness: 0,
    body: 0,
    bitterness: 0,
    aroma: 0,
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
   * Combines F-3.2 (statistics) and F-3.3 (review list)
   */
  const fetchUserReviews = async () => {
    try {
      setLoading(true);

      // Fetch reviews by current user
      const userReviews = await getReviewsByUser(user.uid);

      // Calculate statistics and flavor preferences
      calculateStatistics(userReviews);
      calculateFlavorPreference(userReviews);

      // Fetch cafe information for each review
      await enrichReviewsWithCafeInfo(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      // Handle error gracefully - show empty state
      setReviewsWithCafeInfo([]);
      setStatistics({ totalCoffees: 0, favoriteTag: null, avgRating: 0 });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enrich reviews with cafe information
   * For v0.1, we fetch cafe data for each review individually
   */
  const enrichReviewsWithCafeInfo = async (userReviews) => {
    try {
      const enrichedReviews = await Promise.all(
        userReviews.map(async (review) => {
          try {
            const cafe = await getCafeById(review.cafeId);
            return {
              ...review,
              cafeName: cafe.name,
              cafeAddress: cafe.address,
              location: cafe.address,
            };
          } catch (error) {
            console.error(`Failed to fetch cafe ${review.cafeId}:`, error);
            return {
              ...review,
              cafeName: `카페 ID: ${review.cafeId}`,
              cafeAddress: null,
              location: null,
            };
          }
        })
      );

      setReviewsWithCafeInfo(enrichedReviews);
    } catch (error) {
      console.error('Error enriching reviews:', error);
      setReviewsWithCafeInfo(userReviews);
    }
  };

  /**
   * Calculate user statistics
   * F-3.2: Total coffees, favorite tag, average rating
   */
  const calculateStatistics = (userReviews) => {
    const totalCoffees = userReviews.length;

    // Calculate average rating
    let avgRating = 0;
    if (userReviews.length > 0) {
      const totalRating = userReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      avgRating = (totalRating / userReviews.length).toFixed(1);
    }

    // Calculate favorite tag (most frequently used tag)
    let favoriteTag = null;
    if (userReviews.length > 0) {
      const tagCounts = {};
      userReviews.forEach((review) => {
        if (review.basicTags && Array.isArray(review.basicTags)) {
          review.basicTags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      let maxCount = 0;
      Object.entries(tagCounts).forEach(([tag, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteTag = tag;
        }
      });
    }

    setStatistics({ totalCoffees, favoriteTag, avgRating });
  };

  /**
   * Calculate average flavor preference from user reviews
   * Derives user's flavor profile from their review history
   */
  const calculateFlavorPreference = (userReviews) => {
    if (userReviews.length === 0) {
      setFlavorPreference({
        acidity: 0,
        sweetness: 0,
        body: 0,
        bitterness: 0,
        aroma: 0,
      });
      return;
    }

    // Sum up all flavor profiles
    const totals = userReviews.reduce(
      (acc, review) => {
        if (review.flavorProfile) {
          acc.acidity += review.flavorProfile.acidity || 0;
          acc.sweetness += review.flavorProfile.sweetness || 0;
          acc.body += review.flavorProfile.body || 0;
          acc.bitterness += review.flavorProfile.bitterness || 0;
          acc.aroma += review.flavorProfile.aroma || 0;
        }
        return acc;
      },
      { acidity: 0, sweetness: 0, body: 0, bitterness: 0, aroma: 0 }
    );

    // Calculate averages
    const count = userReviews.length;
    setFlavorPreference({
      acidity: Math.round(totals.acidity / count),
      sweetness: Math.round(totals.sweetness / count),
      body: Math.round(totals.body / count),
      bitterness: Math.round(totals.bitterness / count),
      aroma: Math.round(totals.aroma / count),
    });
  };

  /**
   * Generate flavor description based on user's preference
   * Provides personalized insight into user's taste profile
   */
  const getFlavorDescription = () => {
    if (statistics.totalCoffees === 0) {
      return '아직 충분한 기록이 없습니다.\n다양한 커피를 시도해보세요!';
    }

    // Find dominant flavor characteristics
    const flavors = [
      { name: '산미', value: flavorPreference.acidity, key: 'acidity' },
      { name: '단맛', value: flavorPreference.sweetness, key: 'sweetness' },
      { name: '바디감', value: flavorPreference.body, key: 'body' },
      { name: '쓴맛', value: flavorPreference.bitterness, key: 'bitterness' },
      { name: '향', value: flavorPreference.aroma, key: 'aroma' },
    ];

    // Sort by value descending
    flavors.sort((a, b) => b.value - a.value);

    const topFlavor = flavors[0];
    const secondFlavor = flavors[1];

    if (topFlavor.value >= 4) {
      return `${topFlavor.name}${topFlavor.value >= 4.5 ? '가 매우' : '와'} ${secondFlavor.name}이 풍부한 커피를 선호하시네요!\n에티오피아나 케냐 계열의 원두와 잘 맞아요.`;
    }

    return `균형잡힌 맛의 커피를 선호하시는군요!\n다양한 원두를 즐기실 수 있어요.`;
  };

  /**
   * Handle settings button press
   * Navigate to Settings screen
   */
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  /**
   * Handle review edit
   * Navigate to WriteReview screen with review data
   */
  const handleEditReview = (review) => {
    navigation.navigate('WriteReview', {
      editMode: true,
      reviewId: review.id,
      reviewData: review,
      cafe: { id: review.cafeId, name: review.cafeName },
    });
  };

  /**
   * Handle review delete
   * Show confirmation before deletion
   */
  const handleDeleteReview = (review) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('정말로 이 리뷰를 삭제하시겠습니까?');
      if (confirmed) {
        performDeleteReview(review);
      }
    } else {
      Alert.alert(
        '리뷰 삭제',
        '정말로 이 리뷰를 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => performDeleteReview(review),
          },
        ]
      );
    }
  };

  /**
   * Perform actual review deletion
   */
  const performDeleteReview = async (review) => {
    try {
      await deleteReview(review.id);

      if (Platform.OS === 'web') {
        window.alert('리뷰가 성공적으로 삭제되었습니다.');
      } else {
        Alert.alert('삭제 완료', '리뷰가 성공적으로 삭제되었습니다.');
      }

      // Reload reviews
      fetchUserReviews();
    } catch (error) {
      console.error('Error deleting review:', error);

      if (Platform.OS === 'web') {
        window.alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  /**
   * Handle post/review press
   * Navigate to cafe detail or review detail
   */
  const handlePostPress = (post) => {
    if (post.cafeId && navigation) {
      navigation.navigate('CafeDetail', { cafeId: post.cafeId });
    }
  };

  /**
   * Transform review data to match CoffeeCard expected format
   */
  const transformReviewToPost = (review) => {
    return {
      id: review.id,
      cafeName: review.cafeName || '카페 이름 없음',
      coffeeName: review.coffeeName || '커피',
      location: review.location || review.cafeAddress,
      imageUrl: review.photoUrls && review.photoUrls.length > 0 ? review.photoUrls[0] : null,
      rating: review.rating || 0,
      tags: review.basicTags || [],
      flavorProfile: review.flavorProfile || {
        acidity: 0,
        sweetness: 0,
        body: 0,
        bitterness: 0,
        aroma: 0,
      },
      author: {
        name: user?.displayName || '익명',
        avatar: user?.photoURL || null,
        level: 'Barista',
      },
      description: review.comment || '',
      likes: review.likes || 0,
      comments: review.comments || 0,
      date: formatDateRelative(review.createdAt),
      // Additional fields for edit/delete
      reviewId: review.id,
      cafeId: review.cafeId,
      reviewData: review,
    };
  };

  /**
   * Format date to relative time (e.g., "2시간 전")
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

      if (diffMins < 60) {
        return diffMins <= 1 ? '방금 전' : `${diffMins}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else if (diffDays < 30) {
        return `${diffDays}일 전`;
      } else {
        // Format as YYYY.MM.DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // State for saved cafes
  const [savedCafes, setSavedCafes] = useState([]);

  /**
   * Fetch saved cafes
   */
  const fetchSavedCafes = async () => {
    try {
      setLoading(true);
      const cafes = await getSavedCafes(user.uid);
      setSavedCafes(cafes);
    } catch (error) {
      console.error('Error fetching saved cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved cafes when tab changes
  useEffect(() => {
    if (activeTab === 'saved' && user) {
      fetchSavedCafes();
    }
  }, [activeTab, user]);

  /**
   * Render tab content
   * "내 기록" shows user's reviews, "찜한 커피" shows saved items
   */
  const renderTabContent = () => {
    if (activeTab === 'logs') {
      if (reviewsWithCafeInfo.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>아직 기록이 없습니다.</Text>
          </View>
        );
      }

      return (
        <View style={styles.postsContainer}>
          {reviewsWithCafeInfo.map((review, index) => {
            const post = transformReviewToPost(review);
            return (
              <View key={post.id} style={styles.postWrapper}>
                <CoffeeCard post={post} index={index} onPress={() => handlePostPress(post)} />

                {/* Edit/Delete action buttons */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditReview(review)}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>수정</Text>
                  </TouchableOpacity>

                  <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteReview(review)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    if (activeTab === 'saved') {
      if (savedCafes.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={Colors.stone300} />
            <Text style={styles.emptyStateText}>아직 찜한 커피가 없습니다.</Text>
          </View>
        );
      }

      return (
        <View style={styles.postsContainer}>
          {savedCafes.map((cafe, index) => (
            <TouchableOpacity
              key={cafe.id}
              style={[styles.savedCafeCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}
              onPress={() => navigation.navigate('CafeDetail', { cafeId: cafe.id })}
            >
              <View style={styles.savedCafeContent}>
                <View style={[styles.savedCafeIcon, { backgroundColor: colors.stone100 }]}>
                  <Ionicons name="cafe" size={24} color={Colors.amber600} />
                </View>
                <View style={styles.savedCafeInfo}>
                  <Text style={[styles.savedCafeName, { color: colors.textPrimary }]}>{cafe.name}</Text>
                  <Text style={[styles.savedCafeAddress, { color: colors.textSecondary }]}>{cafe.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner visible={true} fullScreen={false} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: colors.backgroundWhite, borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            {/* Avatar and Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {(user?.displayName || '익명').charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.displayName || '익명'}</Text>
                <Text style={[styles.userBio, { color: colors.textSecondary }]}>{user?.email || '오늘도 맛있는 한 잔 ☕️'}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons name="trophy" size={12} color={Colors.amber700} />
                  <Text style={styles.levelText}>Barista Level</Text>
                </View>
              </View>
            </View>

            {/* Settings Button (triggers logout) */}
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{statistics.totalCoffees}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>기록</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{statistics.avgRating || '0.0'}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>평균 별점</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {statistics.favoriteTag ? `#${statistics.favoriteTag}` : '-'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>선호 태그</Text>
            </View>
          </View>

          {/* Flavor Preference Card */}
          <View style={[styles.flavorCard, { backgroundColor: colors.stone50 }]}>
            <View style={styles.flavorContent}>
              <View style={styles.flavorTextContainer}>
                <Text style={[styles.flavorTitle, { color: colors.textPrimary }]}>나의 커피 취향</Text>
                <Text style={[styles.flavorDescription, { color: colors.textSecondary }]}>
                  {getFlavorDescription()}
                </Text>
              </View>
              {statistics.totalCoffees > 0 && (
                <View style={styles.flavorProfileContainer}>
                  <FlavorProfile flavorProfile={flavorPreference} />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsSection}>
          {/* Tab Headers */}
          <View style={styles.tabHeaders}>
            <TouchableOpacity
              style={[
                styles.tabHeader,
                activeTab === 'logs' && [styles.tabHeaderActive, { borderBottomColor: colors.textPrimary }],
              ]}
              onPress={() => setActiveTab('logs')}
            >
              <Ionicons
                name="cafe"
                size={16}
                color={activeTab === 'logs' ? colors.textPrimary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.tabHeaderText,
                  { color: colors.textTertiary },
                  activeTab === 'logs' && [styles.tabHeaderTextActive, { color: colors.textPrimary }],
                ]}
              >
                내 기록
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabHeader,
                activeTab === 'saved' && [styles.tabHeaderActive, { borderBottomColor: colors.textPrimary }],
              ]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name="heart"
                size={16}
                color={
                  activeTab === 'saved' ? colors.textPrimary : colors.textTertiary
                }
              />
              <Text
                style={[
                  styles.tabHeaderText,
                  { color: colors.textTertiary },
                  activeTab === 'saved' && [styles.tabHeaderTextActive, { color: colors.textPrimary }],
                ]}
              >
                찜한 커피
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>{renderTabContent()}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.stone50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header Section (ProfileScreen design)
  headerSection: {
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone200,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.stone100,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.stone300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.backgroundWhite,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.stone800,
    marginBottom: 4,
  },
  userBio: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.amber100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.amber700,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.stone200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
  },

  // Stats (ProfileScreen design with real data)
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.stone800,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.stone200,
  },

  // Flavor Card (ProfileScreen design with calculated data)
  flavorCard: {
    backgroundColor: Colors.stone50,
    borderRadius: 16,
    padding: 16,
  },
  flavorContent: {
    gap: 16,
  },
  flavorTextContainer: {
    gap: 4,
  },
  flavorTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
  },
  flavorDescription: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone600,
    lineHeight: 18,
  },
  flavorProfileContainer: {
    paddingVertical: 8,
  },

  // Tabs Section (ProfileScreen design)
  tabsSection: {
    marginTop: 24,
  },
  tabHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone200,
    paddingHorizontal: 16,
    gap: 32,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabHeaderActive: {
    borderBottomColor: Colors.stone900,
  },
  tabHeaderText: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone500,
  },
  tabHeaderTextActive: {
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone900,
  },

  // Tab Content (ProfileScreen design)
  tabContent: {
    marginTop: 24,
  },
  postsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  postWrapper: {
    marginBottom: 8,
  },

  // Review Actions (edit/delete buttons)
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingVertical: 8,
  },

  // Saved Cafe Card
  savedCafeCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  savedCafeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedCafeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.amber100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedCafeInfo: {
    flex: 1,
  },
  savedCafeName: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone800,
    marginBottom: 4,
  },
  savedCafeAddress: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone600,
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.stone300,
  },

  // Empty State (ProfileScreen design)
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone400,
    marginTop: 16,
  },
});

export default MyPageScreen;
