// BeanLog - FlavorProfile Component
// Displays coffee flavor profile with horizontal bars (RN version of FlavorRadar)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const FlavorProfile = ({ flavorProfile }) => {
  const flavorData = [
    { label: '산미', value: flavorProfile.acidity },
    { label: '단맛', value: flavorProfile.sweetness },
    { label: '바디', value: flavorProfile.body },
    { label: '쓴맛', value: flavorProfile.bitterness },
    { label: '향', value: flavorProfile.aroma },
  ];

  const maxValue = 5;

  return (
    <View style={styles.container}>
      {flavorData.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                { width: `${(item.value / maxValue) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.textSecondary,
    width: 40,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.stone200,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent, // amber-600
    borderRadius: 3,
  },
  value: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
});

export default FlavorProfile;
