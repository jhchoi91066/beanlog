import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { Colors } from '../constants';

const FlavorRadar = ({ data, size = 200 }) => {
    // Data structure expected:
    // [
    //   { subject: 'Acidity', A: 3, fullMark: 5 },
    //   { subject: 'Sweetness', A: 4, fullMark: 5 },
    //   ...
    // ]

    const center = size / 2;
    const radius = (size / 2) * 0.8; // Leave some padding for labels
    const angleSlice = (Math.PI * 2) / 5; // 5 axes

    // Helper to calculate coordinates
    const getCoordinates = (value, index, maxVal) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / maxVal) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    // Generate grid polygons (levels 1 to 5)
    const gridLevels = [1, 2, 3, 4, 5];
    const gridPolygons = gridLevels.map((level) => {
        const points = data.map((_, i) => {
            const { x, y } = getCoordinates(level, i, 5);
            return `${x},${y}`;
        }).join(' ');
        return points;
    });

    // Generate data polygon
    const dataPoints = data.map((d, i) => {
        const { x, y } = getCoordinates(d.A, i, d.fullMark);
        return `${x},${y}`;
    }).join(' ');

    // Generate axes lines
    const axes = data.map((_, i) => {
        const { x, y } = getCoordinates(5, i, 5);
        return { x1: center, y1: center, x2: x, y2: y };
    });

    // Generate labels
    const labels = data.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const labelRadius = radius * 1.25; // Place labels slightly outside
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
                    fillOpacity="0.4"
                    stroke={Colors.amber600}
                    strokeWidth="2"
                />

                {/* Data Points (Circles) */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(d.A, i, d.fullMark);
                    return (
                        <Circle
                            key={`point-${i}`}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={Colors.amber600}
                        />
                    );
                })}

                {/* Labels */}
                {labels.map((label, i) => (
                    <SvgText
                        key={`label-${i}`}
                        x={label.x}
                        y={label.y}
                        fill={Colors.stone600}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                    >
                        {label.text}
                    </SvgText>
                ))}
            </Svg>
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

export default FlavorRadar;
