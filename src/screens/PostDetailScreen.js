import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import AnimatedHeart from '../components/AnimatedHeart';
import {
    toggleLike,
    toggleBookmark,
    sharePost,
    incrementViews,
    addComment,
    getComments,
    deletePost
} from '../services/communityService';
import { auth } from '../services/firebase';

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

const PostDetailScreen = ({ route, navigation }) => {
    const { post } = route.params;
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [commentsCount, setCommentsCount] = useState(post.comments);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Load comments and increment views on mount
    useEffect(() => {
        loadComments();
        // Only increment views for real posts
        if (post.id && !post.id.toString().startsWith('mock-')) {
            incrementViews(post.id).catch(err => console.log('View increment skipped:', err.message));
        }
    }, [post.id]);

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const commentsData = await getComments(post.id);
            setComments(commentsData);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleLike = async () => {
        try {
            const result = await toggleLike(post.id);
            setIsLiked(result.isLiked);
            setLikesCount(result.likes);
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBookmark = async () => {
        try {
            const result = await toggleBookmark(post.id);
            setIsBookmarked(result);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleShare = async () => {
        try {
            await sharePost(post);
        } catch (error) {
            console.error('Error sharing post:', error);
        }
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('알림', '댓글 내용을 입력해주세요.');
            return;
        }

        try {
            setSubmittingComment(true);
            const newComment = await addComment(post.id, commentText.trim());

            // Add comment to local state
            setComments(prev => [newComment, ...prev]);
            setCommentsCount(prev => prev + 1);
            setCommentText('');

            Alert.alert('성공', '댓글이 등록되었습니다.');
        } catch (error) {
            console.error('Error submitting comment:', error);
            Alert.alert('오류', '댓글 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditPost = () => {
        // Navigate to WritePost screen with post data for editing
        navigation.navigate('WritePost', {
            editMode: true,
            post: post
        });
    };

    const handleDeletePost = async () => {
        try {
            await deletePost(post.id);
            Alert.alert('성공', '게시글이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('오류', error.message || '게시글 삭제에 실패했습니다.');
        }
    };

    const handlePostMenu = () => {
        const currentUser = auth.currentUser;
        const isAuthor = currentUser && post.userId === currentUser.uid;

        // Different options for author vs non-author
        const options = isAuthor
            ? ['게시글 수정', '게시글 삭제', '링크 복사', '취소']
            : ['링크 복사', '신고하기', '취소'];

        const destructiveButtonIndex = isAuthor ? 1 : 1;
        const cancelButtonIndex = isAuthor ? 3 : 2;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    destructiveButtonIndex,
                    cancelButtonIndex,
                },
                (buttonIndex) => {
                    if (isAuthor) {
                        if (buttonIndex === 0) {
                            // Edit post
                            handleEditPost();
                        } else if (buttonIndex === 1) {
                            // Delete post
                            Alert.alert(
                                '게시글 삭제',
                                '정말로 이 게시글을 삭제하시겠습니까?',
                                [
                                    { text: '취소', style: 'cancel' },
                                    {
                                        text: '삭제',
                                        style: 'destructive',
                                        onPress: handleDeletePost
                                    }
                                ]
                            );
                        } else if (buttonIndex === 2) {
                            // Copy link
                            Alert.alert('성공', '링크가 복사되었습니다.');
                        }
                    } else {
                        if (buttonIndex === 0) {
                            // Copy link
                            Alert.alert('성공', '링크가 복사되었습니다.');
                        } else if (buttonIndex === 1) {
                            // Report
                            Alert.alert('알림', '신고 기능은 준비중입니다.');
                        }
                    }
                }
            );
        } else {
            // Android - use Alert.alert with buttons
            if (isAuthor) {
                Alert.alert(
                    '게시글 관리',
                    '작업을 선택하세요',
                    [
                        {
                            text: '게시글 수정',
                            onPress: handleEditPost
                        },
                        {
                            text: '게시글 삭제',
                            style: 'destructive',
                            onPress: () => {
                                Alert.alert(
                                    '게시글 삭제',
                                    '정말로 이 게시글을 삭제하시겠습니까?',
                                    [
                                        { text: '취소', style: 'cancel' },
                                        {
                                            text: '삭제',
                                            style: 'destructive',
                                            onPress: handleDeletePost
                                        }
                                    ]
                                );
                            }
                        },
                        {
                            text: '링크 복사',
                            onPress: () => Alert.alert('성공', '링크가 복사되었습니다.')
                        },
                        { text: '취소', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert(
                    '게시글 관리',
                    '작업을 선택하세요',
                    [
                        {
                            text: '링크 복사',
                            onPress: () => Alert.alert('성공', '링크가 복사되었습니다.')
                        },
                        {
                            text: '신고하기',
                            style: 'destructive',
                            onPress: () => Alert.alert('알림', '신고 기능은 준비중입니다.')
                        },
                        { text: '취소', style: 'cancel' }
                    ]
                );
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleBookmark} style={styles.headerIcon}>
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={24}
                            color={isBookmarked ? Colors.brand : Colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
                        <Ionicons name="share-social-outline" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePostMenu} style={styles.headerIcon}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Post Content */}
                <View style={styles.postContainer}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{post.category}</Text>
                    </View>

                    <Text style={styles.title}>{post.title}</Text>

                    <View style={styles.authorRow}>
                        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
                        <View>
                            <Text style={styles.authorName}>{post.author.name}</Text>
                            <Text style={styles.timeText}>{post.timeAgo}</Text>
                        </View>
                    </View>

                    <Text style={styles.bodyText}>{post.content}</Text>

                    <View style={styles.tagContainer}>
                        {post.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>#{tag}</Text>
                            </View>
                        ))}
                    </View>



                    <View style={styles.statsRow}>
                        <View style={styles.statButton}>
                            <AnimatedHeart
                                isLiked={isLiked}
                                onToggle={handleLike}
                                size={24}
                            />
                            <Text style={[styles.statText, isLiked && { color: Colors.brand }]}>
                                {likesCount}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={24} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{commentsCount}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{post.views}</Text>
                        </View>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>댓글 {commentsCount}</Text>

                    {loadingComments ? (
                        <View style={styles.commentsLoadingContainer}>
                            <ActivityIndicator size="small" color={Colors.brand} />
                            <Text style={styles.loadingText}>댓글을 불러오는 중...</Text>
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={styles.emptyComments}>
                            <Ionicons name="chatbubble-outline" size={32} color={Colors.border} />
                            <Text style={styles.emptyText}>첫 댓글을 남겨보세요!</Text>
                        </View>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                                <View style={styles.commentContent}>
                                    <View style={styles.commentHeader}>
                                        <Text style={styles.commentAuthor}>{comment.userName}</Text>
                                        <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                                    </View>
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Comment Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    placeholder="댓글을 입력하세요..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    editable={!submittingComment}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSubmitComment}
                    disabled={submittingComment || !commentText.trim()}
                >
                    {submittingComment ? (
                        <ActivityIndicator size="small" color={Colors.brand} />
                    ) : (
                        <Ionicons
                            name="send"
                            size={20}
                            color={commentText.trim() ? Colors.brand : Colors.textSecondary}
                        />
                    )}
                </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerIcon: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    postContainer: {
        backgroundColor: Colors.card,
        padding: 20,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
        lineHeight: 28,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.border,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    timeText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    bodyText: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 26,
        marginBottom: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },

    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    statButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    commentsSection: {
        backgroundColor: Colors.card,
        padding: 20,
        minHeight: 200,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.border,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    commentTime: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    commentText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.card,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        padding: 8,
    },
    commentsLoadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    emptyComments: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textSecondary,
    },
});

export default PostDetailScreen;
