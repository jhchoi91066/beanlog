// BeanLog - Tag Component
// Displays tags with # prefix (e.g., #고소한, #부드러운)
// Follows The Foundation design system

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

/**
 * Tag - A reusable tag component for displaying flavor/taste labels
 *
 * @param {string} label - Tag text to display (# prefix will be added automatically)
 * @param {boolean} selected - Whether the tag is in selected state (default: false)
 * @param {function} onPress - Callback function when tag is pressed (optional)
 * @param {object} style - Additional custom styles to apply
 */
const Tag = ({
  label,
  selected = false,
  onPress,
  style
}) => {
  // Determine tag styles based on selected state
  const tagStyle = [
    styles.tag,
    selected ? styles.selectedTag : styles.unselectedTag,
    style,
  ];

  const textStyle = [
    styles.tagText,
    selected ? styles.selectedText : styles.unselectedText,
  ];

  // If onPress is provided, make it interactive
  const Component = onPress ? TouchableOpacity : React.Fragment;
  const componentProps = onPress ? {
    style: tagStyle,
    onPress: onPress,
    activeOpacity: 0.7,
  } : {};

  // If not interactive, we need to wrap in a View-like container
  if (!onPress) {
    return (
      <React.Fragment>
        <Text style={[tagStyle, { alignSelf: 'flex-start' }]}>
          <Text style={textStyle}>#{label}</Text>
        </Text>
      </React.Fragment>
    );
  }

  return (
    <Component {...componentProps}>
      <Text style={textStyle}>#{label}</Text>
    </Component>
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
  tagText: {
    fontSize: Typography.tag.fontSize,
    fontWeight: Typography.tag.fontWeight,
    lineHeight: Typography.tag.lineHeight,
  },
  // Selected text: white color
  selectedText: {
    color: Colors.background,
  },
  // Unselected text: secondary text color
  unselectedText: {
    color: Colors.textSecondary,
  },
});

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Tag;
