import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NaverMapView from './NaverMapView';
import { Colors, Typography } from '../constants';

const MiniMap = ({ coordinate, cafeName, address }) => {
    const handlePress = () => {
        if (!coordinate) return;

        const { latitude, longitude } = coordinate;
        const label = encodeURIComponent(cafeName || 'Cafe');

        // Open external map
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${label})`
        });

        Linking.openURL(url);
    };

    if (!coordinate || !coordinate.latitude || !coordinate.longitude) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Ionicons name="map-outline" size={32} color={Colors.stone400} />
                    <Text style={styles.placeholderText}>지도 정보를 불러올 수 없습니다</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <NaverMapView
                    initialRegion={{
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        zoom: 15,
                    }}
                    cafes={[{
                        id: 'target',
                        name: cafeName,
                        coordinates: coordinate
                    }]}
                    interactive={false}
                    style={styles.map}
                />

                {/* Overlay to capture touches and open external map */}
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonContainer}>
                        <View style={styles.button}>
                            <Ionicons name="navigate" size={16} color="white" />
                            <Text style={styles.buttonText}>길찾기</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            {address && (
                <View style={styles.addressContainer}>
                    <Ionicons name="location-outline" size={16} color={Colors.stone500} />
                    <Text style={styles.addressText}>{address}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: Colors.stone50,
        borderWidth: 1,
        borderColor: Colors.stone200,
    },
    mapContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    placeholder: {
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.stone100,
    },
    placeholderText: {
        ...Typography.caption,
        color: Colors.stone500,
        marginTop: 8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        ...Typography.caption,
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
        backgroundColor: Colors.backgroundWhite,
    },
    addressText: {
        ...Typography.caption,
        color: Colors.stone700,
        flex: 1,
    },
});

export default MiniMap;
