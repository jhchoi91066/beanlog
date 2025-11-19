// BeanLog - LoadingSpinner Component
// Full-screen loading overlay with centered spinner
// Follows The Foundation design system

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';

/**
 * LoadingSpinner - A full-screen loading overlay component
 *
 * @param {string} size - Size of the spinner: 'small' or 'large' (default: 'large')
 * @param {string} color - Color of the spinner (default: Colors.brand)
 * @param {boolean} visible - Whether the spinner is visible (default: true)
 * @param {boolean} fullScreen - Whether to show as full-screen overlay (default: true)
 */
const LoadingSpinner = ({
  size = 'large',
  color = Colors.brand,
  visible = true,
  fullScreen = true,
}) => {
  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  // Render full-screen overlay with semi-transparent background
  if (fullScreen) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size={size} color={color} />
          </View>
        </View>
      </Modal>
    );
  }

  // Render inline spinner (for use within a container)
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Full-screen overlay styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  // Inline spinner styles
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'large']),
  color: PropTypes.string,
  visible: PropTypes.bool,
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
