import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost, updatePost } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';

const Colors = {
    background: '#FAFAF9',
    card: '#FFFFFF',
    text: '#292524',
    textSecondary: '#78716C',
    brand: '#D97706',
    brandLight: '#FEF3C7',
    border: '#E7E5E4',
    blue: '#2563EB',
    purple: '#9333EA',
    green: '#16A34A',
};

const CATEGORIES = [
    { id: 'discussion', label: '토론', color: Colors.blue },
    { id: 'question', label: '질문', color: Colors.purple },
    { id: 'tip', label: '팁', color: Colors.brand },
];

const WritePostScreen = ({ navigation, route }) => {
    const { initialCategory, editMode, post } = route.params || {};
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'discussion');
    const [tags, setTags] = useState('');
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Initialize form with post data if in edit mode
    useEffect(() => {
        if (editMode && post) {
            setTitle(post.title || '');
            setContent(post.content || '');
            setSelectedCategory(post.type || 'discussion');
            setTags(post.tags?.join(', ') || '');
        }
    }, [editMode, post]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('알림', '제목과 내용을 입력해주세요.');
            return;
        }

        try {
            setSubmitting(true);

            // Map category ID to display label
            const categoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || '일반';

            if (editMode && post) {
                // Update existing post
                const updateData = {
                    type: selectedCategory,
                    title: title.trim(),
                    content: content.trim(),
                    category: categoryLabel,
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                };

                await updatePost(post.id, updateData);

                Alert.alert('성공', '게시글이 수정되었습니다.', [
                    { text: '확인', onPress: () => navigation.goBack() }
                ]);
            } else {
                // Create new post
                const postData = {
                    type: selectedCategory,
                    title: title.trim(),
                    content: content.trim(),
                    category: categoryLabel,
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                    author: {
                        name: user?.displayName || '익명 사용자',
                        avatar: user?.photoURL || 'https://i.pravatar.cc/150?u=default',
                        level: 'Barista', // Default level
                    },
                    createdAt: new Date().toISOString(),
                };

                await createPost(postData);

                Alert.alert('성공', '게시글이 등록되었습니다.', [
                    { text: '확인', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            Alert.alert('오류', editMode ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{editMode ? '글 수정' : '글쓰기'}</Text>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? (editMode ? '수정 중...' : '등록 중...') : (editMode ? '수정' : '등록')}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Category Selection */}
                    <View style={styles.section}>
                        <Text style={styles.label}>카테고리</Text>
                        <View style={styles.categoryContainer}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === cat.id && { color: '#FFF' }
                                    ]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Title Input */}
                    <View style={styles.section}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={50}
                        />
                    </View>

                    {/* Content Input */}
                    <View style={styles.section}>
                        <TextInput
                            style={styles.contentInput}
                            placeholder="내용을 입력하세요. (커피에 대한 궁금증, 노하우 등을 자유롭게 나눠보세요)"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Tags Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>태그</Text>
                        <TextInput
                            style={styles.tagInput}
                            placeholder="#태그 입력 (쉼표로 구분)"
                            value={tags}
                            onChangeText={setTags}
                        />
                        <Text style={styles.helperText}>예: 홈카페, 라떼아트, 원두추천</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    submitButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.brand,
        borderRadius: 20,
    },
    submitButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    categoryText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    titleInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    contentInput: {
        fontSize: 16,
        color: Colors.text,
        minHeight: 200,
        lineHeight: 24,
    },
    tagInput: {
        fontSize: 14,
        color: Colors.text,
        padding: 12,
        backgroundColor: Colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 6,
        marginLeft: 4,
    },
});

export default WritePostScreen;
