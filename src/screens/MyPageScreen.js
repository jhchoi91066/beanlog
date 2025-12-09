// BeanLog - My Page Screen (마이페이지)
// Combines ProfileScreen UI design with actual Firebase data logic
// Features: User profile, stats, flavor preferences, review management

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import CoffeeCard from '../components/CoffeeCard';
import FlavorProfile from '../components/FlavorProfile';
import { LoadingSpinner } from '../components';
import SkeletonLoader from '../components/SkeletonLoader';
import CoffeeCardSkeleton from '../components/CoffeeCardSkeleton';
import PassportStamp from '../components/PassportStamp';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts';
import { getReviewsByUser, deleteReview } from '../services/reviewService';
import { getCafeById, getSavedCafes } from '../services/cafeService';
import { getTasteDescription } from '../services/userService';
import { getUserAchievements } from '../services/achievementService';
import ShareableCard from '../components/ShareableCard';
import { captureAndShare } from '../services/shareService';
import { seedMockData } from '../services/seedService';

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
  const [userPreferences, setUserPreferences] = useState(null); // Onboarding preferences
  const [achievements, setAchievements] = useState([]);

  // Fetch user reviews on mount and when screen comes into focus
  useEffect(() => {
    if (user) {
      fetchUserReviews();
      loadUserPreferences();
      loadAchievements();
    }
  }, [user]);

  // Refresh data when screen comes into focus (e.g., after writing a new review)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchUserReviews();
        loadAchievements();
      }
    }, [user])
  );

  const loadAchievements = async () => {
    try {
      const data = await getUserAchievements(user.uid);
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    }
  };

  const getUnlockDate = (id) => {
    if (!achievements) return null;
    const achievement = achievements.find(a => a.id === id);
    return achievement?.unlockedAt ? formatDateRelative(new Date(achievement.unlockedAt)) : null;
  };

  const isUnlocked = (id) => {
    if (!achievements) return false;
    return achievements.some(a => a.id === id);
  };

  /**
   * Load user preferences from AsyncStorage
   */
  const loadUserPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      if (storedPrefs) {
        setUserPreferences(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

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
      // Optimization: Only fetch cafes that are missing name/address in the review itself
      // This leverages data denormalization to reduce reads
      const enrichedReviews = await Promise.all(
        userReviews.map(async (review) => {
          // If we already have the info (denormalized), skip the fetch
          if (review.cafeName && review.cafeAddress) {
            return {
              ...review,
              location: review.cafeAddress,
            };
          }

          // Fallback: Fetch from Cafe collection (Cost: 1 read)
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
        const profile = review.flavorProfile || review; // Fallback to top-level fields

        acc.acidity += Number(profile.acidity) || 0;
        acc.sweetness += Number(profile.sweetness) || 0;
        acc.body += Number(profile.body) || 0;
        acc.bitterness += Number(profile.bitterness) || 0;
        acc.aroma += Number(profile.aroma) || 0;

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
   * Handle settings button press
   * Navigate to Settings screen
   */
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const viewRef = useRef();

  /**
   * Handle share passport
   */
  const handleSharePassport = async () => {
    try {
      if (viewRef.current) {
        await captureAndShare(viewRef);
      } else {
        // Fallback to text share if ref is not ready
        const tasteDesc = getTasteDescription(userPreferences);
        const message = `[BeanLog 커피 여권]\n\n☕️ ${user?.displayName || '익명'}님의 커피 취향\n"${tasteDesc}"\n\n지금까지 ${statistics.totalCoffees}잔의 커피를 기록했어요.\n\n#BeanLog #커피소믈리에 #커피취향`;

        await Share.share({
          message,
          title: '나의 커피 여권',
        });
      }
    } catch (error) {
      console.error('Error sharing passport:', error);
    }
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

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Passport Card Skeleton */}
          <View style={[styles.passportCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <SkeletonLoader width={150} height={24} borderRadius={4} />
              <SkeletonLoader width={24} height={24} borderRadius={12} />
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 24, gap: 16 }}>
              <SkeletonLoader width={80} height={80} borderRadius={40} />
              <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
                <SkeletonLoader width={120} height={20} borderRadius={4} />
                <SkeletonLoader width={100} height={16} borderRadius={4} />
                <SkeletonLoader width={180} height={14} borderRadius={4} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
              <SkeletonLoader width={80} height={40} borderRadius={4} />
              <SkeletonLoader width={80} height={40} borderRadius={4} />
              <SkeletonLoader width={80} height={40} borderRadius={4} />
            </View>
            <SkeletonLoader width="100%" height={48} borderRadius={8} />
          </View>

          {/* Tabs Skeleton */}
          <View style={{ marginTop: 24, paddingHorizontal: 16, flexDirection: 'row', gap: 32, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 }}>
            <SkeletonLoader width={80} height={24} borderRadius={4} />
            <SkeletonLoader width={80} height={24} borderRadius={4} />
          </View>

          {/* List Skeleton */}
          <View style={{ marginTop: 24, paddingHorizontal: 16, gap: 16 }}>
            {[1, 2].map((key) => (
              <CoffeeCardSkeleton key={key} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Passport Card Section */}
        <View style={[styles.passportCard, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}>
          <View style={styles.passportHeader}>
            <View style={styles.passportTitleRow}>
              <Ionicons name="book" size={20} color={colors.brand} />
              <Text style={[styles.passportTitle, { color: colors.textPrimary }]}>COFFEE PASSPORT</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={async () => {
                const success = await seedMockData();
                if (success) {
                  Alert.alert('성공', '테스트 데이터가 생성되었습니다. 피드를 새로고침하세요.');
                } else {
                  Alert.alert(
                    '권한 오류',
                    'Firestore 보안 규칙이 생성을 차단했습니다.\n\nFirebase Console > Rules에서 다음 규칙을 허용해주세요:\nallow create: if request.auth != null;'
                  );
                }
              }}>
                <Ionicons name="construct-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSettingsPress}>
                <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passportProfile}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{(user?.displayName || '익명').charAt(0)}</Text>
                </View>
              )}
            </View>
            <View style={styles.passportInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.displayName || '익명'}</Text>
              <Text style={[styles.userLevel, { color: colors.brand }]}>Barista Level 1</Text>
              <Text style={[styles.userBio, { color: colors.textSecondary }]}>
                {getTasteDescription(userPreferences)}
              </Text>
            </View>
          </View>

          <View style={styles.passportStats}>
            <View style={styles.passportStatItem}>
              <Text style={[styles.passportStatValue, { color: colors.textPrimary }]}>{statistics.totalCoffees}</Text>
              <Text style={[styles.passportStatLabel, { color: colors.textSecondary }]}>기록</Text>
            </View>
            <View style={[styles.passportStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.passportStatItem}>
              <Text style={[styles.passportStatValue, { color: colors.textPrimary }]}>{statistics.avgRating || '0.0'}</Text>
              <Text style={[styles.passportStatLabel, { color: colors.textSecondary }]}>평점</Text>
            </View>
            <View style={[styles.passportStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.passportStatItem}>
              <Text style={[styles.passportStatValue, { color: colors.textPrimary }]}>
                {statistics.favoriteTag ? `#${statistics.favoriteTag}` : '-'}
              </Text>
              <Text style={[styles.passportStatLabel, { color: colors.textSecondary }]}>최애</Text>
            </View>
          </View>

          {/* Stamps Section */}
          <View style={styles.stampsSection}>
            <Text style={[styles.stampsTitle, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stampsScroll}>
              <PassportStamp
                label="First Cup"
                icon="cafe"
                date={getUnlockDate('first_cup')}
                isLocked={!isUnlocked('first_cup')}
                color={Colors.brand}
              />
              <PassportStamp
                label="Explorer"
                icon="compass"
                date={getUnlockDate('explorer')}
                isLocked={!isUnlocked('explorer')}
                color={Colors.blue}
              />
              <PassportStamp
                label="Master"
                icon="trophy"
                date={getUnlockDate('master')}
                isLocked={!isUnlocked('master')}
                color={Colors.amber600}
              />
              <PassportStamp
                label="Photographer"
                icon="camera"
                date={getUnlockDate('photographer')}
                isLocked={!isUnlocked('photographer')}
                color={Colors.purple}
              />
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.stone100 }]}
            onPress={handleSharePassport}
          >
            <Text style={[styles.shareButtonText, { color: colors.textPrimary }]}>여권 공유하기</Text>
          </TouchableOpacity>
        </View>

        {/* Flavor Profile Section */}
        {statistics.totalCoffees > 0 && (
          <View style={[styles.sectionContainer, { backgroundColor: colors.backgroundWhite, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>나의 미각 분석</Text>
            <View style={styles.flavorProfileContainer}>
              <FlavorProfile flavorProfile={flavorPreference} />
            </View>
          </View>
        )}

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


      {/* Hidden Shareable Card for Capture */}
      <View
        collapsable={false}
        ref={viewRef}
        style={{ position: 'absolute', left: -1000, top: 0 }}
      >
        <ShareableCard
          user={user}
          stats={statistics}
          achievements={achievements}
          flavorProfile={flavorPreference}
        />
      </View>
    </View >
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

  // Passport Card Styles
  passportCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passportTitle: {
    fontSize: Typography.label.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  passportProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  passportInfo: {
    flex: 1,
  },
  userLevel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: 4,
  },
  passportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  passportStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  passportStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  passportStatLabel: {
    fontSize: 12,
  },
  passportStatDivider: {
    width: 1,
    height: '100%',
  },
  stampsSection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.stone200,
  },
  stampsTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stampsScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Section Styles
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  flavorProfileContainer: {
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
