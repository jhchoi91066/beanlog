// Write Review Screen - 리뷰 작성 (리뷰 쓰기 탭)
// 문서 참조: The Blueprint - F-2 리뷰 작성

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Colors, Typography } from '../constants';
import StarRating from '../components/StarRating';
import Tag from '../components/Tag';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import Slider from '../components/Slider';
import { useAuth } from '../contexts/AuthContext';
import { createReview } from '../services/reviewService';
import { getAllCafes } from '../services/cafeService';

// F-2.2: Basic Mode - Taste Tags
const BASIC_TAGS = ['상큼한', '고소한', '달콤한', '묵직한', '부드러운', '꽃향기'];

// F-2.3: Advanced Mode - Flavor Notes
const ADVANCED_TAGS = ['시트러스', '초콜릿', '견과류', '베리', '플로럴', '스파이시'];

// F-2.3: Roasting Levels
const ROASTING_LEVELS = ['Light', 'Medium', 'Dark'];

const WriteReviewScreen = ({ navigation, route }) => {
  const { user } = useAuth();

  // F-2.1: Cafe Selection State
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [showCafeSelector, setShowCafeSelector] = useState(false);
  const [loadingCafes, setLoadingCafes] = useState(false);

  // F-2.2: Basic Mode State
  const [rating, setRating] = useState(0);
  const [selectedBasicTags, setSelectedBasicTags] = useState([]);
  const [comment, setComment] = useState('');

  // F-2.3: Advanced Mode State
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [acidity, setAcidity] = useState(3);
  const [body, setBody] = useState(3);
  const [selectedAdvancedTags, setSelectedAdvancedTags] = useState([]);
  const [roasting, setRoasting] = useState(null);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load cafes on mount
  useEffect(() => {
    loadCafes();
  }, []);

  // Load cafe from route params if provided (for navigation from cafe detail)
  useEffect(() => {
    if (route.params?.cafe) {
      setSelectedCafe(route.params.cafe);
    }
  }, [route.params]);

  /**
   * Load all cafes for selection
   */
  const loadCafes = async () => {
    try {
      setLoadingCafes(true);
      const fetchedCafes = await getAllCafes();
      setCafes(fetchedCafes);
    } catch (error) {
      console.error('Error loading cafes:', error);
      Alert.alert('오류', '카페 목록을 불러올 수 없습니다.');
    } finally {
      setLoadingCafes(false);
    }
  };

  /**
   * Toggle basic tag selection
   */
  const toggleBasicTag = (tag) => {
    if (selectedBasicTags.includes(tag)) {
      setSelectedBasicTags(selectedBasicTags.filter((t) => t !== tag));
    } else {
      setSelectedBasicTags([...selectedBasicTags, tag]);
    }
    // Clear validation error when user makes changes
    setValidationError('');
  };

  /**
   * Toggle advanced tag selection
   */
  const toggleAdvancedTag = (tag) => {
    if (selectedAdvancedTags.includes(tag)) {
      setSelectedAdvancedTags(selectedAdvancedTags.filter((t) => t !== tag));
    } else {
      setSelectedAdvancedTags([...selectedAdvancedTags, tag]);
    }
  };

  /**
   * F-2.4: Validate form data before submission
   */
  const validateForm = () => {
    // Check if cafe is selected
    if (!selectedCafe) {
      setValidationError('카페를 선택해주세요.');
      return false;
    }

    // Check if rating is provided
    if (rating === 0) {
      setValidationError('별점을 입력해주세요.');
      return false;
    }

    // Check if at least one basic tag is selected
    if (selectedBasicTags.length === 0) {
      setValidationError('맛 태그를 최소 1개 이상 선택해주세요.');
      return false;
    }

    // Check comment length (max 100 characters)
    if (comment.length > 100) {
      setValidationError('한 줄 코멘트는 최대 100자까지 입력 가능합니다.');
      return false;
    }

    return true;
  };

  /**
   * F-2.4: Submit review to Firestore
   */
  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare review data
      const reviewData = {
        userId: user.uid,
        cafeId: selectedCafe.id,
        rating: rating,
        basicTags: selectedBasicTags,
        comment: comment.trim() || null, // Optional field
      };

      // Add advanced mode fields if enabled
      if (showAdvancedMode) {
        reviewData.acidity = acidity;
        reviewData.body = body;
        reviewData.advancedTags = selectedAdvancedTags.length > 0 ? selectedAdvancedTags : null;
        reviewData.roasting = roasting;
      }

      // Submit to Firestore
      await createReview(reviewData);

      // Reset form first
      const cafeId = selectedCafe.id;
      const cafeName = selectedCafe.name;
      resetForm();

      // Show success message and navigate
      Alert.alert(
        '리뷰 작성 완료! 🎉',
        `${cafeName}에 대한 리뷰가 성공적으로 작성되었습니다.`,
        [
          {
            text: '리뷰 보러가기',
            onPress: () => {
              // Navigate to the cafe detail page to see the review
              navigation.navigate('MainTabs', {
                screen: 'Home',
                params: {
                  screen: 'CafeDetail',
                  params: { cafeId }
                }
              });
            },
          },
          {
            text: '홈으로',
            style: 'cancel',
            onPress: () => {
              navigation.navigate('MainTabs', {
                screen: 'Home',
                params: { screen: 'HomeList' }
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('오류', '리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setRating(0);
    setSelectedBasicTags([]);
    setComment('');
    setShowAdvancedMode(false);
    setAcidity(3);
    setBody(3);
    setSelectedAdvancedTags([]);
    setRoasting(null);
    setValidationError('');
  };

  /**
   * Render cafe selector modal
   */
  const renderCafeSelector = () => (
    <Modal
      visible={showCafeSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCafeSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>카페 선택</Text>
            <TouchableOpacity onPress={() => setShowCafeSelector(false)}>
              <Text style={styles.modalCloseButton}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cafeList}>
            {cafes.map((cafe) => (
              <TouchableOpacity
                key={cafe.id}
                style={styles.cafeItem}
                onPress={() => {
                  setSelectedCafe(cafe);
                  setShowCafeSelector(false);
                  setValidationError('');
                }}
              >
                <Text style={styles.cafeName}>{cafe.name}</Text>
                <Text style={styles.cafeLocation}>{cafe.location}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* F-2.1: Cafe Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카페 선택</Text>
          <TouchableOpacity
            style={styles.cafeSelector}
            onPress={() => setShowCafeSelector(true)}
          >
            <Text
              style={[
                styles.cafeSelectorText,
                !selectedCafe && styles.cafeSelectorPlaceholder,
              ]}
            >
              {selectedCafe ? selectedCafe.name : '카페를 선택해주세요'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* F-2.2: Basic Mode - Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            전체 평점 <Text style={styles.required}>*</Text>
          </Text>
          <StarRating
            rating={rating}
            onRatingChange={(newRating) => {
              setRating(newRating);
              setValidationError('');
            }}
            size={32}
            style={styles.starRating}
          />
        </View>

        {/* F-2.2: Basic Mode - Taste Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            맛 태그 <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>최소 1개 이상 선택</Text>
          <View style={styles.tagsContainer}>
            {BASIC_TAGS.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                selected={selectedBasicTags.includes(tag)}
                onPress={() => toggleBasicTag(tag)}
              />
            ))}
          </View>
        </View>

        {/* F-2.2: Basic Mode - Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>한 줄 코멘트 (선택)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="이 카페에 대한 한 줄 평을 남겨주세요 (최대 100자)"
            placeholderTextColor={Colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            maxLength={100}
            multiline
          />
          <Text style={styles.characterCount}>{comment.length}/100</Text>
        </View>

        {/* F-2.3: Advanced Mode Toggle */}
        <View style={styles.section}>
          <CustomButton
            title={showAdvancedMode ? '상세 리뷰 숨기기' : '상세 리뷰 남기기'}
            onPress={() => setShowAdvancedMode(!showAdvancedMode)}
            variant="secondary"
          />
        </View>

        {/* F-2.3: Advanced Mode Fields */}
        {showAdvancedMode && (
          <View style={styles.advancedSection}>
            {/* Acidity Slider */}
            <View style={styles.section}>
              <Slider
                label="산미 (선택)"
                value={acidity}
                onValueChange={setAcidity}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minLabel="낮음"
                maxLabel="높음"
              />
            </View>

            {/* Body Slider */}
            <View style={styles.section}>
              <Slider
                label="바디 (선택)"
                value={body}
                onValueChange={setBody}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minLabel="가벼움"
                maxLabel="묵직함"
              />
            </View>

            {/* Advanced Flavor Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상세 향 (선택)</Text>
              <View style={styles.tagsContainer}>
                {ADVANCED_TAGS.map((tag) => (
                  <Tag
                    key={tag}
                    label={tag}
                    selected={selectedAdvancedTags.includes(tag)}
                    onPress={() => toggleAdvancedTag(tag)}
                  />
                ))}
              </View>
            </View>

            {/* Roasting Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>로스팅 (선택)</Text>
              <View style={styles.roastingContainer}>
                {ROASTING_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.roastingButton,
                      roasting === level && styles.roastingButtonSelected,
                    ]}
                    onPress={() => setRoasting(roasting === level ? null : level)}
                  >
                    <Text
                      style={[
                        styles.roastingButtonText,
                        roasting === level && styles.roastingButtonTextSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Validation Error */}
        {validationError !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        {/* F-2.4: Submit Button */}
        <View style={styles.submitSection}>
          <CustomButton
            title="작성 완료"
            onPress={handleSubmit}
            variant="primary"
            disabled={submitting}
          />
        </View>
      </ScrollView>

      {/* Cafe Selector Modal */}
      {renderCafeSelector()}

      {/* Loading Overlay */}
      <LoadingSpinner visible={submitting} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  required: {
    color: Colors.error,
  },

  // Cafe Selector
  cafeSelector: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: Colors.background,
  },
  cafeSelectorText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  cafeSelectorPlaceholder: {
    color: Colors.textSecondary,
  },

  // Star Rating
  starRating: {
    marginVertical: 8,
  },

  // Tags Container
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  // Comment Input
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },

  // Advanced Section
  advancedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 16,
  },

  // Roasting Buttons
  roastingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roastingButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  roastingButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  roastingButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  roastingButtonTextSelected: {
    color: Colors.background,
  },

  // Submit Section
  submitSection: {
    marginTop: 16,
    marginBottom: 24,
  },

  // Error Display
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    ...Typography.body,
    color: Colors.brand,
    fontWeight: '600',
  },
  cafeList: {
    padding: 20,
  },
  cafeItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  cafeName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cafeLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});

export default WriteReviewScreen;
