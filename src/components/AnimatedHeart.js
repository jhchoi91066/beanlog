import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';

const AnimatedHeart = ({ isLiked, onToggle, size = 24, style }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isLiked) {
            // Bounce animation when liked
            Animated.sequence([
                Animated.spring(scaleValue, {
                    toValue: 1.2,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isLiked]);

    const handlePress = () => {
        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={style}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={size}
                    color={isLiked ? Colors.error : Colors.textPrimary}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

AnimatedHeart.propTypes = {
    isLiked: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    size: PropTypes.number,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default AnimatedHeart;
