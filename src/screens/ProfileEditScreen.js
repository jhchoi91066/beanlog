import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../services/userService';
import { uploadProfileImage, compressImage } from '../services/imageService';
import * as ImagePicker from 'expo-image-picker';

const ProfileEditScreen = ({ navigation }) => {
    const [nickname, setNickname] = useState('커피러버');
    const [bio, setBio] = useState('오늘도 맛있는 한 잔 ☕️');

    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handlePickImage = async () => {
        console.log('handlePickImage called');
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission status:', status);

            if (status !== 'granted') {
                Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            console.log('ImagePicker result:', result.canceled ? 'canceled' : 'picked');

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setLoading(true);

            let photoURL = user.photoURL;
            if (selectedImage) {
                const compressedUri = await compressImage(selectedImage);
                photoURL = await uploadProfileImage(compressedUri, user.uid);
            }

            await updateUser(user.uid, {
                displayName: nickname,
                bio: bio,
                photoURL: photoURL,
            });

            Alert.alert('성공', '프로필이 저장되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('오류', '프로필 저장 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.headerTitle}>프로필 편집</Text>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.7}
                    disabled={loading}
                >
                    <Text style={[styles.saveButtonText, loading && { color: Colors.stone400 }]}>
                        {loading ? '저장 중...' : '저장'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: selectedImage || user?.photoURL || 'https://i.pravatar.cc/150?u=me' }}
                                style={styles.avatar}
                            />
                            <View style={styles.cameraButton}>
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>닉네임</Text>
                            <TextInput
                                style={styles.input}
                                value={nickname}
                                onChangeText={setNickname}
                                placeholder="닉네임을 입력하세요"
                                placeholderTextColor={Colors.stone400}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>소개</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="자기소개를 입력하세요"
                                placeholderTextColor={Colors.stone400}
                                multiline
                                textAlignVertical="top"
                                maxLength={100}
                            />
                            <Text style={styles.charCount}>{bio.length}/100</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
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
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.amber600,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: Colors.backgroundWhite,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.stone800,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.backgroundWhite,
    },
    changePhotoText: {
        fontSize: 14,
        color: Colors.stone500,
    },
    formSection: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.stone900,
    },
    input: {
        backgroundColor: Colors.backgroundWhite,
        borderWidth: 1,
        borderColor: Colors.stone200,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.stone900,
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: Colors.stone400,
    },
});

export default ProfileEditScreen;
