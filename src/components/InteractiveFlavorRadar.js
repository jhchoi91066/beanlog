import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants';

const InteractiveFlavorRadar = ({ data, onDataChange, size = 300, readOnly = false }) => {
    // Data structure expected:
    // [
    //   { subject: 'Acidity', A: 3, fullMark: 5 },
    //   ...
    // ]

    const center = size / 2;
    const radius = (size / 2) * 0.7;
    const angleSlice = (Math.PI * 2) / 5; // 5 axes

    // State to keep track of the currently active axis for dragging
    const [activeAxisIndex, setActiveAxisIndex] = useState(null);

    // Helper to calculate coordinates
    const getCoordinates = (value, index, maxVal) => {
        const angle = index * angleSlice - Math.PI / 2;
        const r = (value / maxVal) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    // Function to find the closest axis to a touch point
    const findClosestAxis = useCallback((x, y) => {
        const dx = x - center;
        const dy = y - center;
        let angle = Math.atan2(dy, dx);

        let touchAngle = angle + Math.PI / 2;
        if (touchAngle < 0) touchAngle += Math.PI * 2;

        let closestIdx = 0;
        let minAngleDiff = Infinity;

        for (let i = 0; i < 5; i++) {
            const axisAngle = i * angleSlice;
            let diff = Math.abs(touchAngle - axisAngle);
            if (diff > Math.PI) diff = Math.PI * 2 - diff;

            if (diff < minAngleDiff) {
                minAngleDiff = diff;
                closestIdx = i;
            }
        }
        return closestIdx;
    }, [center, angleSlice]);

    // PanResponder for handling drag gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !readOnly,
            onMoveShouldSetPanResponder: () => !readOnly,
            onPanResponderGrant: (evt, gestureState) => {
                if (readOnly) return;
                const { locationX, locationY } = evt.nativeEvent;
                const closestIdx = findClosestAxis(locationX, locationY);
                setActiveAxisIndex(closestIdx);
                handleTouch(locationX, locationY, closestIdx);
            },
            onPanResponderMove: (evt, gestureState) => {
                if (readOnly || activeAxisIndex === null) return;
                handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY, activeAxisIndex);
            },
            onPanResponderTerminationRequest: () => false,
            onShouldBlockNativeResponder: () => true,
            onPanResponderRelease: () => {
                setActiveAxisIndex(null);
            },
        })
    ).current;

    const handleTouch = (x, y, axisIndex) => {
        // Calculate value based on distance from center
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp distance to radius
        const clampedDist = Math.min(dist, radius);

        // Map distance to value (0 to 5)
        let newValue = (clampedDist / radius) * 5;

        // Snap to nearest integer for ratings
        newValue = Math.round(newValue);
        if (newValue < 1) newValue = 1; // Minimum 1
        if (newValue > 5) newValue = 5;

        // Update data if changed
        if (data[axisIndex].A !== newValue) {
            const newData = [...data];
            newData[axisIndex].A = newValue;
            onDataChange(newData);

            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    // Generate grid polygons
    const gridLevels = [1, 2, 3, 4, 5];
    const gridPolygons = gridLevels.map((level) => {
        const points = data.map((_, i) => {
            const { x, y } = getCoordinates(level, i, 5);
            return `${x},${y}`;
        }).join(' ');
        return points;
    });

    const dataPoints = data.map((d, i) => {
        const { x, y } = getCoordinates(d.A, i, d.fullMark);
        return `${x},${y}`;
    }).join(' ');

    const axes = data.map((_, i) => {
        const { x, y } = getCoordinates(5, i, 5);
        return { x1: center, y1: center, x2: x, y2: y };
    });

    const labels = data.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const labelRadius = radius * 1.25;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return { x, y, text: d.subject };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg height={size} width={size}>
                {/* Grid Levels */}
                {gridPolygons.map((points, i) => (
                    <Polygon
                        key={`grid-${i}`}
                        points={points}
                        stroke={Colors.stone200}
                        strokeWidth="1"
                        fill="none"
                    />
                ))}

                {/* Axes */}
                {axes.map((axis, i) => (
                    <Line
                        key={`axis-${i}`}
                        x1={axis.x1}
                        y1={axis.y1}
                        x2={axis.x2}
                        y2={axis.y2}
                        stroke={Colors.stone200}
                        strokeWidth="1"
                    />
                ))}

                {/* Data Polygon */}
                <Polygon
                    points={dataPoints}
                    fill={Colors.amber500}
                    fillOpacity="0.6"
                    stroke={Colors.amber600}
                    strokeWidth="3"
                />

                {/* Data Points (Interactive Handles) */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(d.A, i, d.fullMark);
                    return (
                        <G key={`point-${i}`}>
                            <Circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill={Colors.backgroundWhite}
                                stroke={Colors.amber600}
                                strokeWidth="2"
                            />
                            <Circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={Colors.amber600}
                            />
                        </G>
                    );
                })}

                {/* Labels */}
                {labels.map((label, i) => (
                    <SvgText
                        key={`label-${i}`}
                        x={label.x}
                        y={label.y}
                        fill={Colors.stone600}
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                    >
                        {label.text}
                    </SvgText>
                ))}
            </Svg>

            {/* Transparent Touch Layer */}
            <View
                style={StyleSheet.absoluteFill}
                {...panResponder.panHandlers}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});

export default InteractiveFlavorRadar;
