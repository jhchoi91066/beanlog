// BeanLog - EmptyState Component
// Display empty state when no data is available
// Follows The Foundation design system

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import CustomButton from './CustomButton';

/**
 * EmptyState - A component to display when there's no data to show
 *
 * @param {string} message - Message to display to the user
 * @param {React.Component} icon - Optional icon component to display above the message
 * @param {object} actionButton - Optional action button config { title, onPress, variant }
 * @param {object} style - Additional custom styles to apply to container
 */
const EmptyState = ({
  message = '표시할 데이터가 없습니다',
  icon,
  actionButton,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Icon (Default or Custom) */}
      <View style={styles.iconContainer}>
        {icon ? (
          icon
        ) : (
          <Ionicons name="cafe-outline" size={48} color={Colors.stone300} />
        )}
      </View>

      {/* Message text */}
      <Text style={styles.message}>{message}</Text>

      {/* Optional action button */}
      {actionButton && (
        <View style={styles.buttonContainer}>
          <CustomButton
            title={actionButton.title}
            onPress={actionButton.onPress}
            variant={actionButton.variant || 'primary'}
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    lineHeight: Typography.body.lineHeight,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
    width: '100%',
    maxWidth: 200,
  },
  button: {
    width: '100%',
  },
});

EmptyState.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.element,
  actionButton: PropTypes.shape({
    title: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary']),
  }),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default EmptyState;
