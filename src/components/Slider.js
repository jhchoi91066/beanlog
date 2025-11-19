// BeanLog - Slider Component
// Wrapper around @react-native-community/slider for consistent slider display
// Follows The Foundation design system

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNCSlider from '@react-native-community/slider';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

/**
 * Slider - A reusable slider component with labels
 *
 * @param {number} value - Current slider value (1-5)
 * @param {function} onValueChange - Callback function when value changes
 * @param {number} minimumValue - Minimum value (default: 1)
 * @param {number} maximumValue - Maximum value (default: 5)
 * @param {number} step - Step increment (default: 1)
 * @param {string} label - Label to display above slider (optional)
 * @param {boolean} showLabels - Show min/max labels below slider (default: true)
 * @param {string} minLabel - Label for minimum value (default: '1')
 * @param {string} maxLabel - Label for maximum value (default: '5')
 * @param {object} style - Additional custom styles to apply to container
 */
const Slider = ({
  value = 1,
  onValueChange,
  minimumValue = 1,
  maximumValue = 5,
  step = 1,
  label,
  showLabels = true,
  minLabel = '1',
  maxLabel = '5',
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Optional label above slider */}
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {/* Slider component */}
      <RNCSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.brand}
        style={styles.slider}
      />

      {/* Optional min/max labels below slider */}
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={styles.labelText}>{minLabel}</Text>
          <Text style={styles.labelText}>{maxLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  labelText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
});

Slider.propTypes = {
  value: PropTypes.number,
  onValueChange: PropTypes.func.isRequired,
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  step: PropTypes.number,
  label: PropTypes.string,
  showLabels: PropTypes.bool,
  minLabel: PropTypes.string,
  maxLabel: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Slider;
