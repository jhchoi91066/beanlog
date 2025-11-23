// Naver Map View Component - WebView 기반 Naver Maps 통합
// v0.2: F-MAP - 지도 뷰 기능

import React, { useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { Colors, Typography } from '../constants';

const NaverMapView = ({
  cafes,
  onMarkerPress,
  initialRegion,
  userLocation,
  style
}) => {
  const webViewRef = useRef(null);

  // Generate HTML content with Naver Maps
  const generateMapHTML = () => {
    const cafesJSON = JSON.stringify(cafes.filter(cafe => cafe.coordinates));
    const userLocationJSON = JSON.stringify(userLocation);
    const clientId = 'ywaw0lihwo'; // Naver Maps Client ID

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}"></script>
    <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Initialize map
        const mapOptions = {
            center: new naver.maps.LatLng(${initialRegion?.latitude || 37.5665}, ${initialRegion?.longitude || 126.9780}),
            zoom: ${initialRegion?.zoom || 13},
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new naver.maps.Map('map', mapOptions);

        // Cafe data
        const cafes = ${cafesJSON};

        // User location data
        const userLocation = ${userLocationJSON};

        // Add user location marker if available
        if (userLocation && userLocation.latitude && userLocation.longitude) {
            const userMarker = new naver.maps.Marker({
                position: new naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
                map: map,
                title: '내 위치',
                icon: {
                    content: '<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div></div>',
                    size: new naver.maps.Size(40, 40),
                    anchor: new naver.maps.Point(20, 20)
                },
                zIndex: 1000
            });
        }

        // Create cafe markers
        const markers = [];
        cafes.forEach((cafe, index) => {
            if (!cafe.coordinates || !cafe.coordinates._lat || !cafe.coordinates._long) {
                return;
            }

            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(cafe.coordinates._lat, cafe.coordinates._long),
                map: map,
                title: cafe.name,
                icon: {
                    content: '<div style="width: 32px; height: 32px; background-color: #6F4E37; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div></div>',
                    size: new naver.maps.Size(32, 32),
                    anchor: new naver.maps.Point(16, 16)
                }
            });

            // Marker click event
            naver.maps.Event.addListener(marker, 'click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerPress',
                    cafe: cafe
                }));
            });

            markers.push(marker);
        });

        // Fit bounds to show all markers
        if (markers.length > 0) {
            const bounds = new naver.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
        }

        // Send ready message
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapReady'
        }));
    </script>
</body>
</html>
    `;
  };

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(message.cafe);
      } else if (message.type === 'mapReady') {
        console.log('Naver Map loaded successfully');
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // WebView is not supported on web platform
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.webPlaceholder, style]}>
        <Text style={styles.placeholderText}>지도 기능은 모바일 앱에서만 사용 가능합니다</Text>
        <Text style={styles.placeholderSubtext}>iOS 또는 Android 앱을 사용해주세요</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: generateMapHTML() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand} />
          </View>
        )}
        style={styles.webview}
      />
    </View>
  );
};

NaverMapView.propTypes = {
  cafes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMarkerPress: PropTypes.func,
  initialRegion: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    zoom: PropTypes.number,
  }),
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  style: PropTypes.object,
};

NaverMapView.defaultProps = {
  onMarkerPress: null,
  initialRegion: {
    latitude: 37.5665, // Seoul
    longitude: 126.9780,
    zoom: 13,
  },
  userLocation: null,
  style: {},
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  webPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.stone100,
    borderRadius: 16,
    padding: 32,
  },
  placeholderText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone600,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.stone500,
    textAlign: 'center',
  },
});

export default NaverMapView;
