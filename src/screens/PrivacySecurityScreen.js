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
import { sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';
import { deleteUser, getBlockedUsers } from '../services/userService';

const PrivacySecurityScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();

    const handlePasswordChange = async () => {
        console.log('handlePasswordChange called', user);
        if (!user) {
            console.log('User is null');
            return;
        }

        // Check if user is signed in with password provider
        const isPasswordProvider = user.providerData.some(
            (provider) => provider.providerId === 'password'
        );

        if (isPasswordProvider) {
            Alert.alert(
                '비밀번호 변경',
                `${user.email}로 비밀번호 재설정 이메일을 보내시겠습니까?`,
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '보내기',
                        onPress: async () => {
                            try {
                                console.log('Sending password reset email to:', user.email);
                                await sendPasswordResetEmail(auth, user.email);
                                console.log('Password reset email sent successfully');
                                Alert.alert('전송 완료', '비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.');
                            } catch (error) {
                                console.error('Error sending password reset email:', error);
                                Alert.alert('오류', '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
                            }
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                '알림',
                '소셜 로그인(Google/Apple)을 사용 중입니다. 해당 서비스에서 비밀번호를 변경해주세요.'
            );
        }
    };

    const handleBlockManagement = async () => {
        if (!user) return;

        try {
            const blockedUsers = await getBlockedUsers(user.uid);
            if (blockedUsers.length === 0) {
                Alert.alert('차단 관리', '차단한 사용자가 없습니다.');
            } else {
                // Navigate to BlockedUsersScreen (to be implemented)
                Alert.alert('준비중', '차단 목록 화면은 준비 중입니다.');
            }
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            Alert.alert('오류', '차단 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleDataManagement = () => {
        Alert.alert(
            '데이터 관리',
            '원하시는 작업을 선택해주세요.',
            [
                {
                    text: '캐시 삭제',
                    onPress: () => {
                        Alert.alert(
                            '캐시 삭제',
                            '앱의 임시 데이터(검색 기록 등)를 삭제하시겠습니까?',
                            [
                                { text: '취소', style: 'cancel' },
                                {
                                    text: '삭제',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            // Clear specific keys
                                            await AsyncStorage.multiRemove(['search_history', 'recent_searches']);
                                            Alert.alert('완료', '캐시가 삭제되었습니다.');
                                        } catch (error) {
                                            console.error('Error clearing cache:', error);
                                            Alert.alert('오류', '캐시 삭제 중 문제가 발생했습니다.');
                                        }
                                    }
                                }
                            ]
                        );
                    }
                },
                {
                    text: '데이터 내보내기',
                    onPress: () => {
                        Alert.alert(
                            '데이터 내보내기',
                            '회원님의 활동 데이터를 이메일로 받으시겠습니까?',
                            [
                                { text: '취소', style: 'cancel' },
                                {
                                    text: '요청',
                                    onPress: () => {
                                        // Simulate request
                                        setTimeout(() => {
                                            Alert.alert('요청 완료', '데이터 추출이 시작되었습니다. 완료되면 이메일로 발송됩니다.');
                                        }, 1000);
                                    }
                                }
                            ]
                        );
                    }
                },
                { text: '닫기', style: 'cancel' }
            ]
        );
    };



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
