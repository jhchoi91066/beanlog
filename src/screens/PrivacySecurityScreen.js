import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import { useAuth } from '../contexts/AuthContext';
import { deleteUser } from '../services/userService';

const PrivacySecurityScreen = ({ navigation }) => {
    const handlePasswordChange = () => {
        Alert.alert('준비중', '비밀번호 변경 기능은 곧 출시됩니다.');
    };

    const handleBlockManagement = () => {
        Alert.alert('준비중', '차단 관리 기능은 곧 출시됩니다.');
    };

    const handleDataManagement = () => {
        Alert.alert('준비중', '데이터 관리 기능은 곧 출시됩니다.');
    };

    const { user, signOut } = useAuth();

    const handleDeleteAccount = () => {
        Alert.alert(
            '회원 탈퇴',
            '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며 모든 데이터가 삭제됩니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '탈퇴',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // 1. Delete user data from Firestore
                            await deleteUser(user.uid);

                            // 2. Delete user authentication
                            // Note: This requires recent login. If it fails, we might need to re-authenticate.
                            await user.delete();

                            // 3. Sign out (handled automatically by auth state change usually, but good to be explicit)
                            // await signOut(); 

                            Alert.alert('알림', '탈퇴 처리가 완료되었습니다.');
                        } catch (error) {
                            console.error('Error deleting account:', error);
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert('오류', '보안을 위해 다시 로그인한 후 시도해주세요.');
                            } else {
                                Alert.alert('오류', '회원 탈퇴 중 문제가 발생했습니다.');
                            }
                        }
                    }
                }
            ]
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
                    <Ionicons name="arrow-back" size={24} color={Colors.stone600} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>개인정보 및 보안</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <View style={styles.menuList}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handlePasswordChange}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.stone400} />
                                <View>
                                    <Text style={styles.menuTitle}>비밀번호 변경</Text>
                                    <Text style={styles.menuSubtitle}>주기적인 변경으로 계정을 보호하세요</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={Colors.stone400} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleBlockManagement}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name="ban-outline" size={20} color={Colors.stone400} />
                                <View>
                                    <Text style={styles.menuTitle}>차단 관리</Text>
                                    <Text style={styles.menuSubtitle}>차단한 사용자를 관리합니다</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={Colors.stone400} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleDataManagement}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name="server-outline" size={20} color={Colors.stone400} />
                                <View>
                                    <Text style={styles.menuTitle}>데이터 관리</Text>
                                    <Text style={styles.menuSubtitle}>캐시 삭제 및 데이터 내보내기</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={Colors.stone400} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>위험 구역</Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteButtonText}>회원 탈퇴</Text>
                    </TouchableOpacity>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.stone800,
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.stone200,
        overflow: 'hidden',
        marginBottom: 24,
    },
    menuList: {
        width: '100%',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.stone800,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.stone500,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.stone100,
        marginLeft: 48,
    },
    dangerZone: {
        paddingHorizontal: 4,
    },
    dangerTitle: {
        fontSize: 12,
        color: Colors.stone400,
        marginBottom: 8,
        marginLeft: 4,
    },
    deleteButton: {
        padding: 16,
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2', // red-100
        alignItems: 'flex-start',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.error,
    },
});

export default PrivacySecurityScreen;
