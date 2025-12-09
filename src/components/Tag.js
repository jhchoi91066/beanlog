// BeanLog - Tag Component
// Displays tags with # prefix (e.g., #고소한, #부드러운)
// Follows The Foundation design system with smooth press animations

import React, { useRef } from 'react';
import { Text, StyleSheet, Animated, Pressable, View } from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

/**
 * Tag - A reusable tag component for displaying flavor/taste labels with animations
 *
 * @param {string} label - Tag text to display (# prefix will be added automatically if not present)
 * @param {boolean} selected - Whether the tag is in selected state (default: false)
 * @param {string} variant - Tag variant: 'default', 'secondary' (default: 'default')
 * @param {string} size - Tag size: 'default', 'small' (default: 'default')
 * @param {function} onPress - Callback function when tag is pressed (optional)
 * @param {object} style - Additional custom styles to apply
 */
const Tag = ({
  label,
  selected = false,
  variant = 'default',
  size = 'default',
  onPress,
  style,
  textStyle: customTextStyle,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Remove # if it exists in label to avoid double #
  const displayLabel = label.startsWith('#') ? label : `#${label}`;

  // Determine tag styles based on variant, selected state, and size
  const tagStyle = [
    styles.tag,
    size === 'small' && styles.tagSmall,
    variant === 'secondary' ? styles.secondaryTag : (selected ? styles.selectedTag : styles.unselectedTag),
    style,
  ];

  const textStyle = [
    styles.tagText,
    size === 'small' && styles.tagTextSmall,
    variant === 'secondary' ? styles.secondaryText : (selected ? styles.selectedText : styles.unselectedText),
    customTextStyle,
  ];

  // Press animation handlers
  const handlePressIn = () => {
    Animated.parallel([
      // Scale down to 0.95
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      // Fade to 0.8 opacity
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      // Spring back to original scale
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fade back to full opacity
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // If not interactive, render as static View
  if (!onPress) {
    return (
      <View style={tagStyle}>
        <Text style={textStyle}>{displayLabel}</Text>
      </View>
    );
  }

  // Interactive tag with animations
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Pressable
        style={tagStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{
          color: variant === 'secondary' ? Colors.stone200 : Colors.stone100,
          borderless: false,
        }}
      >
        <Text style={textStyle}>{displayLabel}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16, // Pill-shaped design
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  tagSmall: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  // Selected state: accent background with white text
  selectedTag: {
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  // Unselected state: transparent background with border
  unselectedTag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Secondary variant: stone background (matches web design)
  secondaryTag: {
    backgroundColor: Colors.stone100,
    borderWidth: 0,
  },
  tagText: {
    fontSize: Typography.tag.fontSize,
    fontWeight: Typography.tag.fontWeight,
    lineHeight: Typography.tag.lineHeight,
  },
  tagTextSmall: {
    fontSize: Typography.captionSmall.fontSize,
  },
  // Selected text: white color
  selectedText: {
    color: Colors.background,
  },
  // Unselected text: secondary text color
  unselectedText: {
    color: Colors.textSecondary,
  },
  // Secondary text: stone-600 (matches web design)
  secondaryText: {
    color: Colors.stone600,
  },
});

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'secondary']),
  size: PropTypes.oneOf(['default', 'small']),
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Tag;
