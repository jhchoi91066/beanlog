import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    const [commentText, setCommentText] = useState('');

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)} style={styles.headerIcon}>
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={24}
                            color={isBookmarked ? Colors.brand : Colors.text}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="share-social-outline" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
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
                        <TouchableOpacity onPress={handleLike} style={styles.statButton}>
                            <Ionicons
                                name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
                                size={20}
                                color={isLiked ? Colors.brand : Colors.textSecondary}
                            />
                            <Text style={[styles.statText, isLiked && { color: Colors.brand }]}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{post.comments}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={20} color={Colors.textSecondary} />
                            <Text style={styles.statText}>{post.views}</Text>
                        </View>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>댓글 {post.comments}</Text>

                    {/* Mock Comments */}
                    {[1, 2, 3].map((item) => (
                        <View key={item} style={styles.commentItem}>
                            <Image source={{ uri: `https://i.pravatar.cc/150?u=${item}` }} style={styles.commentAvatar} />
                            <View style={styles.commentContent}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.commentAuthor}>User {item}</Text>
                                    <Text style={styles.commentTime}>1시간 전</Text>
                                </View>
                                <Text style={styles.commentText}>
                                    좋은 정보 감사합니다! 저도 한번 시도해봐야겠네요.
                                </Text>
                            </View>
                        </View>
                    ))}
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
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Ionicons name="send" size={20} color={Colors.brand} />
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
});

export default PostDetailScreen;
