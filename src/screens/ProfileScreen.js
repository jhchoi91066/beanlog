// BeanLog - Profile Screen
// Converted from BeanLog_design/src/components/user/Profile.tsx
// Features: User stats, flavor preferences, tabs (my logs, saved), settings

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import CoffeeCard from '../components/CoffeeCard';
import FlavorProfile from '../components/FlavorProfile';

// Mock user data
const MOCK_USER = {
  name: '커피러버',
  bio: '오늘도 맛있는 한 잔 ☕️',
  level: 'Barista Level',
  avatar: 'https://i.pravatar.cc/150?u=me',
  stats: {
    logs: 42,
    followers: 1200,
    following: 380,
  },
  flavorPreference: {
    acidity: 4,
    sweetness: 3,
    body: 3,
    bitterness: 2,
    aroma: 5,
  },
  flavorDescription:
    '산미와 향이 풍부한 커피를 선호하시네요!\n에티오피아 계열의 원두와 잘 맞아요.',
};

// Mock user posts
const MOCK_USER_POSTS = [
  {
    id: '1',
    cafeName: '블루보틀 성수',
    coffeeName: '뉴올리언스',
    location: '서울 성동구',
    imageUrl:
      'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    tags: ['달콤함', '부드러움', '시그니처'],
    flavorProfile: {
      acidity: 2,
      sweetness: 5,
      body: 4,
      bitterness: 2,
      aroma: 4,
    },
    author: {
      name: '커피러버',
      avatar: 'https://i.pravatar.cc/150?u=1',
      level: 'Barista',
    },
    description:
      '블루보틀의 시그니처 메뉴. 치커리와 섞은 콜드브루에 우유와 유기농 설탕을 넣어 달콤하고 부드러운 맛이 일품입니다.',
    likes: 124,
    comments: 12,
    date: '2시간 전',
  },
];

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'saved'

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleEditProfile = () => {
    // Profile edit screen not yet implemented
    Alert.alert('준비중', '프로필 편집 기능은 곧 출시됩니다.');
  };

  const handlePostPress = (post) => {
    // Navigate to cafe detail if available
    if (post.cafeId && navigation) {
      navigation.navigate('CafeDetail', { cafeId: post.cafeId });
    }
  };

  // Render tab content
  const renderTabContent = () => {
    if (activeTab === 'logs') {
      if (MOCK_USER_POSTS.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Ionicons name="cafe-outline" size={48} color={Colors.stone300} />
            <Text style={styles.emptyStateText}>아직 기록이 없습니다.</Text>
          </View>
        );
      }
      return (
        <View style={styles.postsContainer}>
          {MOCK_USER_POSTS.map((post, index) => (
            <CoffeeCard
              key={post.id}
              post={post}
              index={index}
              onPress={() => handlePostPress(post)}
            />
          ))}
        </View>
      );
    }

    if (activeTab === 'saved') {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color={Colors.stone300} />
          <Text style={styles.emptyStateText}>아직 찜한 커피가 없습니다.</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            {/* Avatar and Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                {MOCK_USER.avatar ? (
                  <Image
                    source={{ uri: MOCK_USER.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {MOCK_USER.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{MOCK_USER.name}</Text>
                <Text style={styles.userBio}>{MOCK_USER.bio}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons name="trophy" size={12} color={Colors.amber700} />
                  <Text style={styles.levelText}>{MOCK_USER.level}</Text>
                </View>
              </View>
            </View>

            {/* Settings Button */}
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.stone600} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.stats.logs}</Text>
              <Text style={styles.statLabel}>기록</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {MOCK_USER.stats.followers >= 1000
                  ? `${(MOCK_USER.stats.followers / 1000).toFixed(1)}k`
                  : MOCK_USER.stats.followers}
              </Text>
              <Text style={styles.statLabel}>팔로워</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{MOCK_USER.stats.following}</Text>
              <Text style={styles.statLabel}>팔로잉</Text>
            </View>
          </View>

          {/* Flavor Preference Card */}
          <View style={styles.flavorCard}>
            <View style={styles.flavorContent}>
              <View style={styles.flavorTextContainer}>
                <Text style={styles.flavorTitle}>나의 커피 취향</Text>
                <Text style={styles.flavorDescription}>
                  {MOCK_USER.flavorDescription}
                </Text>
              </View>
              <View style={styles.flavorProfileContainer}>
                <FlavorProfile flavorProfile={MOCK_USER.flavorPreference} />
              </View>
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
                activeTab === 'logs' && styles.tabHeaderActive,
              ]}
              onPress={() => setActiveTab('logs')}
            >
              <Ionicons
                name="cafe"
                size={16}
                color={activeTab === 'logs' ? Colors.stone900 : Colors.stone500}
              />
              <Text
                style={[
                  styles.tabHeaderText,
                  activeTab === 'logs' && styles.tabHeaderTextActive,
                ]}
              >
                내 기록
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabHeader,
                activeTab === 'saved' && styles.tabHeaderActive,
              ]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name="heart"
                size={16}
                color={
                  activeTab === 'saved' ? Colors.stone900 : Colors.stone500
                }
              />
              <Text
                style={[
                  styles.tabHeaderText,
                  activeTab === 'saved' && styles.tabHeaderTextActive,
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

  // Header Section
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

  // Stats
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

  // Flavor Card
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

  // Tabs Section
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

  // Tab Content
  tabContent: {
    marginTop: 24,
  },
  postsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
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

export default ProfileScreen;
