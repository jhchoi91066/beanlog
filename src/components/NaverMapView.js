// Naver Map View Component - WebView 기반 Naver Maps 통합
// v0.3: Optimized rendering with injectJavaScript

import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'prop-types';
import { Colors, Typography } from '../constants';

const NaverMapView = ({
  cafes,
  onMarkerPress,
  initialRegion,
  userLocation,
  style,
  interactive = true,
  onRegionChangeComplete // Added this
}) => {
  console.log('NaverMapView rendered with:', { userLocation, initialRegion });
  const webViewRef = useRef(null);

  // Generate HTML content with Naver Maps - Memoized to prevent reloads
  const mapHTML = useMemo(() => {
    const clientId = process.env.EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID || 'ywaw0lihwo'; // Naver Maps Client ID
    console.log('Debugging Naver Map Client ID:', clientId);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}"></script>
    <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Global variables
        var map;
        var markers = [];
        var userMarker;

        // Auth failure handler
        window.navermap_authFailure = function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: 'Naver Map Authentication Failed'
            }));
        }

        // Initialize map
        var mapOptions = {
            center: new naver.maps.LatLng(${initialRegion?.latitude || 37.5665}, ${initialRegion?.longitude || 126.9780}),
            zoom: ${initialRegion?.zoom || 13},
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
            zoomControl: ${interactive},
            draggable: ${interactive},
            pinchZoom: ${interactive},
            scrollWheel: ${interactive},
            keyboardShortcuts: ${interactive},
            disableDoubleTapZoom: ${!interactive},
            disableDoubleClickZoom: ${!interactive},
            disableTwoFingerTapZoom: ${!interactive},
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            }
        };

        map = new naver.maps.Map('map', mapOptions);

        // Function to update markers
        window.updateMarkers = function(cafes) {
            // Clear existing markers
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];

            // Add new markers
            cafes.forEach(function(cafe) {
                var lat = cafe.coordinates.latitude || cafe.coordinates._lat;
                var lng = cafe.coordinates.longitude || cafe.coordinates._long;

                if (lat && lng) {
                    var marker = new naver.maps.Marker({
                        position: new naver.maps.LatLng(lat, lng),
                        map: map,
                        title: cafe.name,
                        icon: {
                            content: '<div style="width: 14px; height: 14px; background-color: #6F4E37; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
                            size: new naver.maps.Size(14, 14),
                            anchor: new naver.maps.Point(7, 7)
                        }
                    });

                    naver.maps.Event.addListener(marker, 'click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'markerPress', // Changed from markerClick to markerPress to match existing handler
                            cafe: cafe
                        }));
                    });

                    markers.push(marker);
                }
            });
        };

        // Function to move map to location (centers map)
        window.moveToLocation = function(lat, lng) {
            var newCenter = new naver.maps.LatLng(lat, lng);
            map.morph(newCenter, 16); // Smooth transition
            window.updateUserMarker(lat, lng);
        };

        // Function to update user marker only (does not move map center)
        window.updateUserMarker = function(lat, lng) {
            var newPosition = new naver.maps.LatLng(lat, lng);
            
            if (userMarker) {
                userMarker.setPosition(newPosition);
            } else {
                userMarker = new naver.maps.Marker({
                    position: newPosition,
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
        };

        // Event listeners for map movement
        naver.maps.Event.addListener(map, 'idle', function() {
            var center = map.getCenter();
            var zoom = map.getZoom();
            var bounds = map.getBounds();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                region: {
                    latitude: center.lat(),
                    longitude: center.lng(),
                    zoom: zoom,
                    latitudeDelta: bounds.getMax().lat() - bounds.getMin().lat(),
                    longitudeDelta: bounds.getMax().lng() - bounds.getMin().lng()
                }
            }));
        });


        // Send ready message
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapReady',
            origin: window.location.href
        }));
    </script>
</body>
</html>
    `;
  }, [interactive]);

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(message.cafe);
      } else if (message.type === 'regionChange' && onRegionChangeComplete) {
        onRegionChangeComplete(message.region);
      } else if (message.type === 'mapReady') {
        console.log('✅ Naver Map loaded successfully');
        console.log('📍 WebView Origin:', message.origin);

        // Move to user location if available
        if (userLocation && userLocation.latitude && userLocation.longitude) {
          console.log('📍 Moving to user location on mapReady:', userLocation);
          webViewRef.current?.injectJavaScript(`
            if (window.moveToLocation) {
              window.moveToLocation(${userLocation.latitude}, ${userLocation.longitude});
            }
          `);
        }

        // Initial markers update
        if (cafes && cafes.length > 0) {
          const cafesJSON = JSON.stringify(cafes.filter(cafe => cafe.coordinates));
          webViewRef.current?.injectJavaScript(`
            if (window.updateMarkers) {
              window.updateMarkers(${cafesJSON});
            }
          `);
        }
      } else if (message.type === 'error') {
        console.error('❌ Naver Map error:', message.message);
        console.log('💡 Tip: 네이버 클라우드 플랫폼에서 모바일 앱 패키지 이름을 등록해야 합니다.');
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
        source={{ html: mapHTML, baseUrl: 'http://localhost' }}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand} />
          </View>
        )}
        style={styles.webview}
        onLoadEnd={() => {
          // Inject error handler for Naver Maps API errors
          webViewRef.current?.injectJavaScript(`
            (function() {
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('Naver')) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: e.message
                  }));
                }
              });
            })();
          `);
        }}
      />
    </View>
  );
};

NaverMapView.propTypes = {
  cafes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMarkerPress: PropTypes.func,
  onRegionChangeComplete: PropTypes.func,
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
  interactive: PropTypes.bool,
};

NaverMapView.defaultProps = {
  onMarkerPress: null,
  onRegionChangeComplete: null,
  initialRegion: {
    latitude: 37.5665, // Seoul
    longitude: 126.9780,
    zoom: 13,
  },
  userLocation: null,
  style: {},
  interactive: true,
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
