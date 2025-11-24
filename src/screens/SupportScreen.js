import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={[styles.faqItem, !expanded && styles.faqItemBorder]}>
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.questionText}>{question}</Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.stone400}
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.faqContent}>
                    <Text style={styles.answerText}>{answer}</Text>
                </View>
            )}
        </View>
    );
};

const SupportScreen = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>도움말 및 문의</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
                    <View style={styles.card}>
                        <FAQItem
                            question="원두 기록은 어떻게 하나요?"
                            answer="하단 내비게이션의 (+) 버튼을 눌러 커피 기록 화면으로 진입할 수 있습니다. 사진과 함께 맛을 기록해보세요."
                        />
                        <FAQItem
                            question="레벨은 어떻게 올리나요?"
                            answer="커피 기록을 작성하고 다른 사용자와 소통하면 경험치가 쌓여 레벨이 올라갑니다."
                        />
                        <FAQItem
                            question="다크 모드를 지원하나요?"
                            answer="네, 설정 > 앱 설정 > 다크 모드에서 설정하실 수 있습니다."
                        />
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>문의하기</Text>
                    <View style={styles.contactGrid}>
                        <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                            <Ionicons name="mail-outline" size={24} color={Colors.amber600} />
                            <Text style={styles.contactText}>이메일 문의</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButton} activeOpacity={0.7}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.amber600} />
                            <Text style={styles.contactText}>1:1 채팅</Text>
                        </TouchableOpacity>
                    </View>
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.stone800,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.stone200,
        overflow: 'hidden',
    },
    faqItem: {
        backgroundColor: Colors.backgroundWhite,
    },
    faqItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.stone100,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionText: {
        fontSize: 14,
        color: Colors.stone700,
        flex: 1,
        marginRight: 8,
    },
    faqContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: Colors.stone50,
    },
    answerText: {
        fontSize: 14,
        color: Colors.stone500,
        lineHeight: 20,
    },
    contactGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    contactButton: {
        flex: 1,
        backgroundColor: Colors.backgroundWhite,
        paddingVertical: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.stone200,
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.stone700,
    },
});

export default SupportScreen;
