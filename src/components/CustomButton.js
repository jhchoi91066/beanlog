// BeanLog - CustomButton Component
// Reusable button component with primary and secondary variants
// Follows The Foundation design system

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

/**
 * CustomButton - A reusable button component with two variants
 *
 * @param {string} title - Button text to display
 * @param {function} onPress - Callback function when button is pressed
 * @param {string} variant - Button style variant: 'primary' or 'secondary' (default: 'primary')
 * @param {boolean} disabled - Whether the button is disabled (default: false)
 * @param {boolean} loading - Show loading spinner instead of title (default: false)
 * @param {object} style - Additional custom styles to apply
 */
const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style
}) => {
  // Determine button styles based on variant and disabled state
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
    disabled && styles.disabledText,
  ];

  // Disable interaction when button is disabled or loading
  const isInteractionDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.background : Colors.brand}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Minimum touch target size for accessibility
  },
  // Primary variant: accent background with white text
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  // Secondary variant: transparent background with border
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.brand,
  },
  // Disabled state: reduced opacity
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    lineHeight: Typography.body.lineHeight,
  },
  // Primary text: white color
  primaryText: {
    color: Colors.background,
  },
  // Secondary text: brand color
  secondaryText: {
    color: Colors.brand,
  },
  disabledText: {
    // Opacity is handled by button container
  },
});

CustomButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default CustomButton;
