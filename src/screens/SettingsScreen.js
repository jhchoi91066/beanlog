// BeanLog - Settings Screen
// Converted from BeanLog_design/src/components/user/SettingsPage.tsx
// Features: Account settings, app preferences, support options, logout

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Navigate to Profile Edit screen
  const handleProfileEdit = () => {
    navigation.navigate('ProfileEdit');
  };

  // Navigate to Privacy & Security screen
  const handlePrivacySecurity = () => {
    navigation.navigate('PrivacySecurity');
  };

  // Navigate to Help & Support screen
  const handleHelpSupport = () => {
    navigation.navigate('Support');
  };

  // Toggle notifications
  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    // Note: UI-only toggle for v0.1. Actual notification settings will be implemented in future version
  };

  // Toggle dark mode
  const handleDarkModeToggle = (value) => {
    setDarkModeEnabled(value);
    // Note: UI-only toggle for v0.1. Actual dark mode will be implemented in future version
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by AuthContext state change
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.stone600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>계정</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Profile Edit */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemWithBorder]}
              onPress={handleProfileEdit}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.iconAmber]}>
                  <Ionicons name="person" size={16} color={Colors.amber600} />
                </View>
                <Text style={styles.settingLabel}>프로필 편집</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.stone400}
              />
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handlePrivacySecurity}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.iconGreen]}>
                  <Ionicons name="shield" size={16} color={Colors.green600} />
                </View>
                <Text style={styles.settingLabel}>개인정보 및 보안</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.stone400}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>앱 설정</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Notifications */}
            <View style={[styles.settingItem, styles.settingItemWithBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.iconBlue]}>
                  <Ionicons
                    name="notifications"
                    size={16}
                    color={Colors.blue600}
                  />
                </View>
                <Text style={styles.settingLabel}>알림 설정</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{
                  false: Colors.stone300,
                  true: Colors.accent,
                }}
                thumbColor={Colors.backgroundWhite}
                ios_backgroundColor={Colors.stone300}
              />
            </View>

            {/* Dark Mode */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.iconPurple]}>
                  <Ionicons name="moon" size={16} color={Colors.purple600} />
                </View>
                <Text style={styles.settingLabel}>다크 모드</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{
                  false: Colors.stone300,
                  true: Colors.accent,
                }}
                thumbColor={Colors.backgroundWhite}
                ios_backgroundColor={Colors.stone300}
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>지원</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Help & Support */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleHelpSupport}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.iconOrange]}>
                  <Ionicons
                    name="help-circle"
                    size={16}
                    color={Colors.orange600}
                  />
                </View>
                <Text style={styles.settingLabel}>도움말 및 문의하기</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.stone400}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color={Colors.error} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone200,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.stone800,
    marginLeft: 8,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },

  // Section
  section: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.stone50,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.stone200,
  },
  sectionTitle: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: '700',
    color: Colors.stone500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionContent: {
    backgroundColor: Colors.backgroundWhite,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.stone200,
    overflow: 'hidden',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone700,
  },

  // Icon Container
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconAmber: {
    backgroundColor: Colors.amber100,
  },
  iconGreen: {
    backgroundColor: Colors.green100,
  },
  iconBlue: {
    backgroundColor: Colors.blue100,
  },
  iconPurple: {
    backgroundColor: Colors.purple100,
  },
  iconOrange: {
    backgroundColor: Colors.orange100,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2', // red-100
  },
  logoutText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.error,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone400,
  },
});

export default SettingsScreen;
