// BeanLog - Explore Screen
// Converted from BeanLog_design/src/components/explore/Explore.tsx
// Features: Curated collections, editor's picks, category grid

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const { width } = Dimensions.get('window');

// Mock curated collections data
const CURATED_COLLECTIONS = [
  {
    id: 1,
    title: '성수동 커피 투어',
    subtitle: '공장지대에서 피어난 커피향',
    image:
      'https://images.unsplash.com/photo-1550559256-32644b7a2993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3VyJTIwb3ZlciUyMGNvZmZlZSUyMGJyZXdpbmd8ZW58MXx8fHwxNzYzNjMyMDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    title: '비 오는 날, 따뜻한 라떼',
    subtitle: '감성 충전이 필요할 때',
    image:
      'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZSUyMGN1cHxlbnwxfHx8fDE3NjM3MTAzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    title: '스페셜티 입문하기',
    subtitle: '커피의 신세계로 초대합니다',
    image:
      'https://images.unsplash.com/photo-1674141867738-38c11cc707cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMHRleHR1cmV8ZW58MXx8fHwxNzYzNzEwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

// Categories for browsing
const CATEGORIES = [
  '스페셜티',
  '디카페인',
  '핸드드립',
  '에스프레소바',
  '디저트맛집',
  '대형카페',
  '로스팅',
  '원두구매',
];

const ExploreScreen = ({ navigation }) => {
  const handleCollectionPress = (collection) => {
    // Navigate to search with collection context
    // In future versions, pass collection data to filter search results
    navigation.navigate('Search', {
      prefilledSearch: collection.title,
      source: 'collection'
    });
  };

  const handleCategoryPress = (category) => {
    // Navigate to search with category filter
    // In future versions, pass category to pre-filter search results
    navigation.navigate('Search', {
      prefilledSearch: category,
      source: 'category'
    });
  };

  const handleViewAllPress = () => {
    // Navigate to search to explore all collections
    navigation.navigate('Search', { source: 'explore_all' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>탐색하기</Text>
          <Text style={styles.subtitle}>
            새로운 커피 경험을 발견해보세요.
          </Text>
        </View>

        {/* Editor's Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이번 주 에디터 픽</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewAllPress}
            >
              <Text style={styles.viewAllText}>더보기</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.amber600}
              />
            </TouchableOpacity>
          </View>

          {/* Collection Cards */}
          <View style={styles.collectionsContainer}>
            {CURATED_COLLECTIONS.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionCard}
                onPress={() => handleCollectionPress(collection)}
                activeOpacity={0.9}
              >
                <ImageBackground
                  source={{ uri: collection.image }}
                  style={styles.collectionImage}
                  imageStyle={styles.collectionImageStyle}
                >
                  {/* Gradient overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                    style={styles.collectionGradient}
                  >
                    <View style={styles.collectionContent}>
                      <View style={styles.editorBadge}>
                        <Text style={styles.editorBadgeText}>Editor's Pick</Text>
                      </View>
                      <Text style={styles.collectionTitle}>
                        {collection.title}
                      </Text>
                      <Text style={styles.collectionSubtitle}>
                        {collection.subtitle}
                      </Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.categoryTitle]}>
            카테고리별로 찾기
          </Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryText}>#{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.stone800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.stone500,
  },

  // Section
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone800,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.amber600,
  },

  // Collections
  collectionsContainer: {
    gap: 24,
  },
  collectionCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundWhite,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  collectionImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  collectionImageStyle: {
    borderRadius: 16,
  },
  collectionGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  collectionContent: {
    padding: 24,
  },
  editorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.amber500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  editorBadgeText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.backgroundWhite,
  },
  collectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.backgroundWhite,
    marginBottom: 4,
    // Text shadow for better readability
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  collectionSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone200,
    // Text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Categories
  categoryTitle: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    // Calculate width for 2 columns with gap
    width: (width - 48 - 12) / 2,
    backgroundColor: Colors.backgroundWhite,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone600,
  },
});

export default ExploreScreen;
