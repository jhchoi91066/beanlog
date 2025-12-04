// BeanLog - CoffeeCard Component
// Matches BeanLog_design web version structure with smooth touch animations
// Animations: fade-in + slide-up on mount, press scale, image zoom, button feedback

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import FlavorRadar from './FlavorRadar';
import Tag from './Tag';
import FlavorProfile from './FlavorProfile';
import AnimatedHeart from './AnimatedHeart';
import { getCafePlaceholderImage } from '../utils/imageUtils';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px padding on each side

const CoffeeCard = ({ post, onPress, onCommentPress, index = 0 }) => {
  const { colors } = useTheme();
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const slideAnim = useRef(new Animated.Value(50)).current; // Initial y: 50
  const scaleAnim = useRef(new Animated.Value(1)).current; // Card press scale
  const imageScaleAnim = useRef(new Animated.Value(1)).current; // Image zoom on press

  // Like button animation states
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const likeColorAnim = useRef(new Animated.Value(0)).current;

  // Comment button animation
  const commentScaleAnim = useRef(new Animated.Value(1)).current;

  // Share button animation
  const shareScaleAnim = useRef(new Animated.Value(1)).current;

  // Image state
  const [displayImage, setDisplayImage] = useState(post.imageUrl);

  // Generate placeholder if image is missing
  useEffect(() => {
    if (!post.imageUrl) {
      // Use the new placeholder logic
      const placeholder = getCafePlaceholderImage(post.tags, post.coffeeName);
      setDisplayImage(placeholder);
    } else {
      setDisplayImage(post.imageUrl);
    }
  }, [post.imageUrl, post.tags, post.coffeeName]);

  // Mount animation with stagger effect based on index
  useEffect(() => {
    // Stagger animation: 100ms delay per card
    const delay = index * 150; // Increased delay for more noticeable ripple

    Animated.parallel([
      // Fade in: opacity 0 → 1
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600, // Slower fade
        delay,
        useNativeDriver: true,
      }),
      // Slide up: y: 50 → 0 (Increased distance)
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  // Card press handlers
  const onCardPressIn = () => {
    Animated.parallel([
      // Card scales down slightly
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      // Image zooms in subtly
      Animated.spring(imageScaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onCardPressOut = () => {
    Animated.parallel([
      // Card bounces back
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Image returns to normal
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Like button press animation
  const handleLikePress = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    Animated.sequence([
      // Scale down
      Animated.timing(likeScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      // Scale up (overshoot)
      Animated.spring(likeScaleAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Return to normal
      Animated.spring(likeScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Color transition animation
    Animated.timing(likeColorAnim, {
      toValue: newLikedState ? 1 : 0, // Fixed logic: 1 if liked, 0 if not
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Comment button press animation
  const handleCommentPressIn = () => {
    Animated.spring(commentScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleCommentPressOut = () => {
    Animated.spring(commentScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Share button press animation
  const handleSharePressIn = () => {
    Animated.spring(shareScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleSharePressOut = () => {
    Animated.spring(shareScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate like button color from gray to red
  const likeIconColor = likeColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textTertiary, Colors.red500],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        style={[styles.card, { backgroundColor: colors.backgroundWhite }]}
        onPress={onPress}
        onPressIn={onCardPressIn}
        onPressOut={onCardPressOut}
        android_ripple={{ color: colors.stone100 }}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: displayImage || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop' }}
            style={[
              styles.image,
              {
                transform: [{ scale: imageScaleAnim }],
              },
            ]}
            resizeMode="cover"
            onError={(e) => {
              console.log('[CoffeeCard] Image load error:', e.nativeEvent.error);
              setDisplayImage('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop');
            }}
          />
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={Colors.amber500} />
            <Text style={styles.ratingText}>{post.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.coffeeName, { color: colors.stone800 }]}>{post.coffeeName}</Text>
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.cafeName, { color: colors.textSecondary }]}>{post.cafeName}</Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
            <TouchableOpacity
              style={styles.shareButton}
              onPressIn={handleSharePressIn}
              onPressOut={handleSharePressOut}
              activeOpacity={1}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Description */}
          <Text style={[styles.description, { color: colors.stone600 }]} numberOfLines={2}>
            {post.description}
          </Text>

          {/* Flavor Profile - Updated to use FlavorRadar */}
          <View style={[styles.flavorContainer, { backgroundColor: colors.stone50 }]}>
            <View style={styles.radarContainer}>
              <FlavorRadar
                data={[
                  { subject: '산미', A: post.flavorProfile.acidity, fullMark: 5 },
                  { subject: '단맛', A: post.flavorProfile.sweetness, fullMark: 5 },
                  { subject: '바디', A: post.flavorProfile.body, fullMark: 5 },
                  { subject: '쓴맛', A: post.flavorProfile.bitterness, fullMark: 5 },
                  { subject: '향', A: post.flavorProfile.aroma, fullMark: 5 },
                ]}
                size={140}
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, tagIndex) => (
              <Tag
                key={tagIndex}
                label={`#${tag}`}
                variant="secondary"
                size="small"
              />
            ))}
          </View>
        </View>

        {/* Footer Section */}
        <View style={[styles.footer, { borderTopColor: colors.stone100 }]}>
          {/* Author Info */}
          <View style={styles.authorContainer}>
            <View style={styles.avatar}>
              {post.author.avatar ? (
                <Image
                  source={{ uri: post.author.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.stone300 }]}>
                  <Text style={[styles.avatarText, { color: colors.backgroundWhite }]}>
                    {post.author.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.authorName, { color: colors.stone600 }]}>{post.author.name}</Text>
          </View>

          {/* Interactions */}
          <View style={styles.interactions}>
            {/* Like Button with animation */}
            <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
              <View style={styles.interactionButton}>
                {/* Like Button with Animation */}
                <AnimatedHeart
                  isLiked={isLiked}
                  onToggle={handleLikePress}
                  size={24}
                />
                <Text style={[styles.interactionText, { color: colors.textTertiary }]}>{likeCount}</Text>
              </View>
            </Animated.View>

            {/* Comment Button with animation */}
            <Animated.View style={{ transform: [{ scale: commentScaleAnim }] }}>
              <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => {
                  // Bouncy animation like Heart
                  Animated.sequence([
                    Animated.timing(commentScaleAnim, {
                      toValue: 0.8,
                      duration: 100,
                      useNativeDriver: true,
                    }),
                    Animated.spring(commentScaleAnim, {
                      toValue: 1.2,
                      friction: 3,
                      tension: 40,
                      useNativeDriver: true,
                    }),
                    Animated.spring(commentScaleAnim, {
                      toValue: 1,
                      friction: 3,
                      tension: 40,
                      useNativeDriver: true,
                    }),
                  ]).start();

                  if (onCommentPress) onCommentPress();
                }}
                activeOpacity={1}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={colors.textTertiary}
                />
                <Text style={[styles.interactionText, { color: colors.textTertiary }]}>{post.comments}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    // Shadow for iOS - enhanced on press
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden', // Ensures image scale doesn't overflow
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.backgroundWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  coffeeName: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone800,
    lineHeight: Typography.h3.lineHeight,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cafeName: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  shareButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  description: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone600,
    lineHeight: Typography.caption.lineHeight,
    marginBottom: 16,
  },
  flavorContainer: {
    backgroundColor: Colors.stone50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center', // Center the radar chart
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.stone100,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  avatarImage: {
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
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.backgroundWhite,
  },
  authorName: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone600,
  },
  interactions: {
    flexDirection: 'row',
    gap: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.textTertiary,
  },
});

export default CoffeeCard;
