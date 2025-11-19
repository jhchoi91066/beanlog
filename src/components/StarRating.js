// BeanLog - StarRating Component
// Wrapper around react-native-ratings library for consistent star rating display
// Follows The Foundation design system

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';

/**
 * StarRating - A reusable star rating component
 *
 * @param {number} rating - Current rating value (0-5)
 * @param {function} onRatingChange - Callback function when rating changes (optional)
 * @param {boolean} readonly - Whether the rating is read-only (default: false)
 * @param {number} size - Size of each star in pixels (default: 20)
 * @param {object} style - Additional custom styles to apply to container
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 20,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Rating
        type="custom"
        ratingCount={5}
        imageSize={size}
        startingValue={rating}
        onFinishRating={readonly ? undefined : onRatingChange}
        readonly={readonly}
        // Custom colors from design system
        ratingColor={Colors.starActive}
        ratingBackgroundColor={Colors.starInactive}
        tintColor={Colors.background}
        // Remove tap gesture if readonly
        showRating={false}
        // Styling
        style={styles.rating}
        // Accessibility
        minValue={0}
        jumpValue={0.5} // Allow half-star ratings
        fractions={1} // Show fractional stars
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  rating: {
    alignItems: 'flex-start',
  },
});

StarRating.propTypes = {
  rating: PropTypes.number,
  onRatingChange: PropTypes.func,
  readonly: PropTypes.bool,
  size: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default StarRating;
