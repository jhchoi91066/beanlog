import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

const PassportStamp = ({
    icon = "cafe",
    label = "Stamp",
    date,
    color = Colors.brand,
    isLocked = false,
    size = 70
}) => {
    // Random rotation for "stamped" effect
    const rotation = React.useMemo(() => {
        return Math.floor(Math.random() * 30) - 15 + 'deg';
    }, []);

    if (isLocked) {
        return (
            <View style={[styles.container, { width: size, height: size, opacity: 0.3 }]}>
                <View style={[styles.stampBorder, { borderColor: Colors.stone400, borderStyle: 'dashed' }]}>
                    <Ionicons name="lock-closed" size={size * 0.4} color={Colors.stone400} />
                </View>
                <Text style={[styles.label, { color: Colors.stone400, fontSize: size * 0.14 }]}>LOCKED</Text>
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            {
                width: size,
                height: size,
                transform: [{ rotate: rotation }]
            }
        ]}>
            <View style={[styles.stampBorder, { borderColor: color }]}>
                <View style={[styles.innerCircle, { borderColor: color }]}>
                    <Ionicons name={icon} size={size * 0.4} color={color} />
                    {date && (
                        <Text style={[styles.date, { color: color, fontSize: size * 0.12 }]}>
                            {date}
                        </Text>
                    )}
                </View>
            </View>
            <Text style={[styles.label, { color: color, fontSize: size * 0.14 }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,
    },
    stampBorder: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        // Ink bleed effect simulation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    innerCircle: {
        width: '85%',
        height: '85%',
        borderRadius: 100,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        bottom: '15%',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    date: {
        position: 'absolute',
        top: '20%',
        fontWeight: '600',
        opacity: 0.8,
    }
});

export default PassportStamp;
