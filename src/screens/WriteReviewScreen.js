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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants';
import StarRating from '../components/StarRating';
import Tag from '../components/Tag';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import Slider from '../components/Slider';
import FlavorRadar from '../components/FlavorRadar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { createReview, updateReview } from '../services/reviewService';
import { getAllCafes, createCafe } from '../services/cafeService';
import { uploadMultipleReviewImages } from '../services/imageService';
import { searchNaverPlaces } from '../services/naverSearchService';

// F-2.2: Basic Mode - Taste Tags
const BASIC_TAGS = ['상큼한', '고소한', '달콤한', '묵직한', '부드러운', '꽃향기'];

// F-2.3: Advanced Mode - Flavor Notes
const ADVANCED_TAGS = ['시트러스', '초콜릿', '견과류', '베리', '플로럴', '스파이시'];

// F-2.3: Roasting Levels
const ROASTING_LEVELS = ['Light', 'Medium', 'Dark'];

const WriteReviewScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // F-2.1: Cafe Selection State
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [showCafeSelector, setShowCafeSelector] = useState(false);
  const [loadingCafes, setLoadingCafes] = useState(false);

  // Search State
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Coffee Name State
  const [coffeeName, setCoffeeName] = useState('');

  // F-2.2: Basic Mode State
  const [rating, setRating] = useState(0);
  const [selectedBasicTags, setSelectedBasicTags] = useState([]);
  const [comment, setComment] = useState('');

  // F-2.3: Advanced Mode State
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [acidity, setAcidity] = useState(3);
  const [sweetness, setSweetness] = useState(3);
  const [body, setBody] = useState(3);
  const [bitterness, setBitterness] = useState(3);
  const [aroma, setAroma] = useState(3);
  const [selectedAdvancedTags, setSelectedAdvancedTags] = useState([]);
  const [roasting, setRoasting] = useState(null);

  // v0.2: F-PHOTO - Photo Upload State
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load cafes on mount
  useEffect(() => {
    loadCafes();
  }, []);

  // Load cafe from route params if provided (for navigation from cafe detail)
  // v0.2: F-EDIT - Also handle edit mode
  useEffect(() => {
    if (route.params?.cafe) {
      setSelectedCafe(route.params.cafe);
    }

    // v0.2: F-EDIT - Pre-populate form for editing
    if (route.params?.editMode && route.params?.reviewData) {
      const review = route.params.reviewData;
      setRating(review.rating || 0);
      setSelectedBasicTags(review.basicTags || []);
      setComment(review.comment || '');
      setCoffeeName(review.coffeeName || '');
      setSelectedPhotos(review.photoUrls?.map(url => ({ uri: url })) || []);

      // Advanced mode fields
      if (review.acidity || review.body || review.advancedTags || review.roasting) {
        setShowAdvancedMode(true);
        setAcidity(review.acidity || 3);
        setSweetness(review.sweetness || 3);
        setBody(review.body || 3);
        setBitterness(review.bitterness || 3);
        setAroma(review.aroma || 3);
        setSelectedAdvancedTags(review.advancedTags || []);
        setRoasting(review.roasting || null);
      }
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
   * Handle cafe search
   */
  const handleSearch = async (text) => {
    setSearchText(text);

    if (!text || text.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const lowerText = text.toLowerCase().trim();

      // 1. Search in existing app cafes
      const localResults = cafes.filter(cafe =>
        cafe.name.toLowerCase().includes(lowerText) ||
        (cafe.address && cafe.address.toLowerCase().includes(lowerText))
      );

      // 2. Search via Naver API
      const naverResults = await searchNaverPlaces(text);

      // 3. Combine results (prioritize local results)
      // Filter out Naver results that might be duplicates of local results (simple name check)
      const uniqueNaverResults = naverResults.filter(nResult =>
        !localResults.some(lResult => lResult.name === nResult.name)
      );

      setSearchResults([...localResults, ...uniqueNaverResults]);
    } catch (error) {
      console.error('Error searching cafes:', error);
      Alert.alert('오류', '카페 검색 중 문제가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * v0.2: F-PHOTO - Request camera/library permissions
   */
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  /**
   * v0.2: F-PHOTO - Pick photos from gallery
   */
  const pickPhotos = async () => {
    // Check if we've reached the limit
    if (selectedPhotos.length >= 3) {
      Alert.alert('사진 제한', '최대 3장까지 업로드할 수 있습니다.');
      return;
    }

    // Request permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0];
        setSelectedPhotos([...selectedPhotos, newPhoto]);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('오류', '사진을 선택할 수 없습니다.');
    }
  };

  /**
   * v0.2: F-PHOTO - Remove selected photo
   */
  const removePhoto = (index) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
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
   * v0.2: F-PHOTO - Include photo upload
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

      let finalCafeId = selectedCafe.id;
      let finalCafeName = selectedCafe.name;
      let finalCafeAddress = selectedCafe.address || '';

      // If selected cafe is from Naver, create it in Firestore first
      if (selectedCafe.isNaverResult) {
        try {
          const newCafeData = {
            name: selectedCafe.name,
            address: selectedCafe.address,
            location: selectedCafe.address, // Compatibility
            description: selectedCafe.description || '',
            telephone: selectedCafe.telephone || '',
            mapx: selectedCafe.mapx,
            mapy: selectedCafe.mapy,
            naverLink: selectedCafe.link || '',
            createdAt: new Date(),
            source: 'naver_search',
          };

          // Create cafe and get new ID
          // Note: createCafe needs to be imported from cafeService
          // We need to ensure createCafe returns the new ID
          const newCafeId = await createCafe(newCafeData);
          finalCafeId = newCafeId;

          // Update selected cafe with real ID to prevent re-creation if user edits review immediately
          setSelectedCafe({ ...selectedCafe, id: newCafeId, isNaverResult: false });
        } catch (cafeError) {
          console.error('Error creating new cafe from Naver result:', cafeError);
          Alert.alert('오류', '새로운 카페 정보를 저장하는데 실패했습니다.');
          setSubmitting(false);
          return;
        }
      }

      // Prepare review data
      const reviewData = {
        userId: user.uid,
        cafeId: finalCafeId,
        cafeName: finalCafeName, // Add cafe name for feed display
        cafeAddress: finalCafeAddress, // Add cafe address for feed display
        rating: rating,
        basicTags: selectedBasicTags,
        comment: comment.trim() || null, // Optional field
        coffeeName: coffeeName.trim() || '시그니처 커피', // Default to signature coffee if not specified
      };

      // Add advanced mode fields if enabled
      if (showAdvancedMode) {
        reviewData.acidity = acidity;
        reviewData.sweetness = sweetness;
        reviewData.body = body;
        reviewData.bitterness = bitterness;
        reviewData.aroma = aroma;
        reviewData.advancedTags = selectedAdvancedTags.length > 0 ? selectedAdvancedTags : null;
        reviewData.roasting = roasting;
      }

      // v0.2: F-PHOTO - Upload photos if any selected
      if (selectedPhotos.length > 0) {
        try {
          const photoUris = selectedPhotos.map(photo => photo.uri);
          const uploadedUrls = await uploadMultipleReviewImages(photoUris, user.uid);
          reviewData.photoUrls = uploadedUrls;
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
          Alert.alert(
            '사진 업로드 실패',
            '사진 업로드에 실패했습니다. 사진 없이 리뷰를 작성하시겠습니까?',
            [
              { text: '취소', style: 'cancel', onPress: () => setSubmitting(false) },
              {
                text: '계속', onPress: async () => {
                  // Continue without photos
                  reviewData.photoUrls = [];
                }
              }
            ]
          );
          return; // Wait for user decision
        }
      } else {
        reviewData.photoUrls = [];
      }

      // v0.2: F-EDIT - Check if edit mode or create mode
      const isEditMode = route.params?.editMode && route.params?.reviewId;

      if (isEditMode) {
        // Update existing review
        await updateReview(route.params.reviewId, reviewData);
      } else {
        // Create new review
        await createReview(reviewData);
      }

      // Reset form first
      const cafeId = selectedCafe.id;
      const cafeName = selectedCafe.name;
      resetForm();

      // Show success message and navigate
      Alert.alert(
        isEditMode ? '리뷰 수정 완료! ✏️' : '리뷰 작성 완료! 🎉',
        isEditMode
          ? `${cafeName}에 대한 리뷰가 성공적으로 수정되었습니다.`
          : `${cafeName}에 대한 리뷰가 성공적으로 작성되었습니다.`,
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
            text: isEditMode ? '마이페이지로' : '홈으로',
            style: 'cancel',
            onPress: () => {
              if (isEditMode) {
                navigation.navigate('MainTabs', {
                  screen: 'MyPage'
                });
              } else {
                navigation.navigate('MainTabs', {
                  screen: 'Home',
                  params: { screen: 'HomeList' }
                });
              }
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
    setCoffeeName('');
    setShowAdvancedMode(false);
    setAcidity(3);
    setSweetness(3);
    setBody(3);
    setBitterness(3);
    setAroma(3);
    setSelectedAdvancedTags([]);
    setRoasting(null);
    setSelectedPhotos([]); // v0.2: F-PHOTO
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
        <View style={[styles.modalContent, { backgroundColor: colors.backgroundWhite }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.stone200 }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>카페 선택</Text>
            <TouchableOpacity onPress={() => setShowCafeSelector(false)}>
              <Text style={[styles.modalCloseButton, { color: colors.textSecondary }]}>닫기</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.stone200 }]}>
            <Ionicons name="search" size={20} color={colors.stone400} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="카페 이름으로 검색 (네이버 검색 포함)"
              placeholderTextColor={colors.stone400}
              value={searchText}
              onChangeText={handleSearch}
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.stone400} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.cafeList}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner visible={true} fullScreen={false} />
              </View>
            ) : (
              <>
                {/* Show search results if searching, otherwise show all cafes */}
                {(searchText ? searchResults : cafes).map((cafe) => (
                  <TouchableOpacity
                    key={cafe.id}
                    style={styles.cafeItem}
                    onPress={() => {
                      setSelectedCafe(cafe);
                      setShowCafeSelector(false);
                      setValidationError('');
                      setSearchText(''); // Reset search
                      setSearchResults([]);
                    }}
                  >
                    <View style={styles.cafeInfoContainer}>
                      <Text style={[styles.cafeName, { color: colors.textPrimary }]}>{cafe.name}</Text>
                      <Text style={[styles.cafeLocation, { color: colors.textSecondary }]}>{cafe.address || cafe.location}</Text>
                      {cafe.isNaverResult && (
                        <View style={styles.naverBadge}>
                          <Text style={styles.naverBadgeText}>NAVER</Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.stone300} />
                  </TouchableOpacity>
                ))}

                {searchText && searchResults.length === 0 && (
                  <View style={styles.emptySearch}>
                    <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>검색 결과가 없습니다.</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>카페 선택</Text>
          <TouchableOpacity
            style={[styles.cafeSelector, { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 }]}
            onPress={() => setShowCafeSelector(true)}
          >
            <Text
              style={[
                styles.cafeSelectorText,
                !selectedCafe && { color: colors.textSecondary },
                selectedCafe && { color: colors.textPrimary }
              ]}
            >
              {selectedCafe ? selectedCafe.name : '카페를 선택해주세요'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Coffee Name Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>커피 이름 (선택)</Text>
          <TextInput
            style={[styles.coffeeNameInput, { backgroundColor: colors.backgroundWhite, color: colors.textPrimary, borderColor: colors.stone200 }]}
            placeholder="예: 아메리카노, 카페라떼, 플랫화이트"
            placeholderTextColor={colors.textSecondary}
            value={coffeeName}
            onChangeText={setCoffeeName}
            maxLength={50}
          />
        </View>

        {/* F-2.2: Basic Mode - Rating */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            맛 태그 <Text style={styles.required}>*</Text>
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>최소 1개 이상 선택</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>나만의 기록 (선택)</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            커피의 맛과 향, 카페의 분위기는 어땠나요?
          </Text>
          <TextInput
            style={[styles.commentInput, { backgroundColor: colors.backgroundWhite, color: colors.textPrimary, borderColor: colors.stone200 }]}
            placeholder="이 카페에 대한 한 줄 평을 남겨주세요 (최대 100자)"
            placeholderTextColor={colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            maxLength={100}
            multiline
          />
          <Text style={[styles.characterCount, { color: colors.textSecondary }]}>{comment.length}/100</Text>
        </View>

        {/* v0.2: F-PHOTO - Photo Upload Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>사진 (선택)</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>최대 3장까지 업로드 가능</Text>

          <View style={styles.photosContainer}>
            {/* Selected Photos */}
            {selectedPhotos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.photoRemoveButton}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Photo Button */}
            {selectedPhotos.length < 3 && (
              <TouchableOpacity
                style={[styles.photoAddButton, { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 }]}
                onPress={pickPhotos}
              >
                <Ionicons name="camera" size={32} color={colors.textSecondary} />
                <Text style={[styles.photoAddText, { color: colors.textSecondary }]}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* F-2.3: Advanced Mode Toggle - Enhanced with icon */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvancedMode(!showAdvancedMode)}
          >
            <View style={styles.advancedToggleContent}>
              <Ionicons
                name={showAdvancedMode ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.amber600}
              />
              <Text style={[styles.advancedToggleText, { color: colors.textPrimary }]}>
                {showAdvancedMode ? '상세 리뷰 숨기기' : '상세 리뷰 남기기'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* F-2.3: Advanced Mode Fields */}
        {showAdvancedMode && (
          <View style={styles.advancedSection}>
            <View style={styles.advancedHeader}>
              <Text style={[styles.advancedTitle, { color: colors.textPrimary }]}>맛 그래프</Text>
              <Text style={[styles.advancedSubtitle, { color: colors.textSecondary }]}>
                상세한 맛 평가를 남겨주세요
              </Text>
            </View>

            {/* Flavor Profile Visualization */}
            <View style={styles.flavorVisualizationContainer}>
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <FlavorRadar
                  data={[
                    { subject: '산미', A: acidity, fullMark: 5 },
                    { subject: '단맛', A: sweetness, fullMark: 5 },
                    { subject: '바디', A: body, fullMark: 5 },
                    { subject: '쓴맛', A: bitterness, fullMark: 5 },
                    { subject: '향', A: aroma, fullMark: 5 },
                  ]}
                  size={200}
                />
              </View>
            </View>

            {/* Acidity Slider */}
            <View style={styles.sliderSection}>
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

            {/* Sweetness Slider */}
            <View style={styles.sliderSection}>
              <Slider
                label="단맛 (선택)"
                value={sweetness}
                onValueChange={setSweetness}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minLabel="낮음"
                maxLabel="높음"
              />
            </View>

            {/* Body Slider */}
            <View style={styles.sliderSection}>
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

            {/* Bitterness Slider */}
            <View style={styles.sliderSection}>
              <Slider
                label="쓴맛 (선택)"
                value={bitterness}
                onValueChange={setBitterness}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minLabel="낮음"
                maxLabel="높음"
              />
            </View>

            {/* Aroma Slider */}
            <View style={styles.sliderSection}>
              <Slider
                label="향 (선택)"
                value={aroma}
                onValueChange={setAroma}
                minimumValue={1}
                maximumValue={5}
                step={1}
                minLabel="약함"
                maxLabel="강함"
              />
            </View>

            {/* Advanced Flavor Tags */}
            <View style={styles.advancedTagsSection}>
              <Text style={[styles.advancedSectionLabel, { color: colors.textPrimary }]}>상세 향 (선택)</Text>
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
            <View style={styles.advancedTagsSection}>
              <Text style={[styles.advancedSectionLabel, { color: colors.textPrimary }]}>로스팅 (선택)</Text>
              <View style={styles.roastingContainer}>
                {ROASTING_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.roastingButton,
                      { backgroundColor: colors.backgroundWhite, borderColor: colors.stone200 },
                      roasting === level && styles.roastingButtonSelected,
                    ]}
                    onPress={() => setRoasting(roasting === level ? null : level)}
                  >
                    <Text
                      style={[
                        styles.roastingButtonText,
                        { color: colors.textSecondary },
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
    ...Typography.h3,
    color: Colors.stone800,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.stone500,
    marginBottom: 12,
  },
  required: {
    color: Colors.error,
  },

  // Cafe Selector
  cafeSelector: {
    borderWidth: 1,
    borderColor: Colors.stone200,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.backgroundWhite,
  },
  cafeSelectorText: {
    ...Typography.body,
    color: Colors.stone800,
  },
  cafeSelectorPlaceholder: {
    color: Colors.stone400,
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
    gap: 8,
  },

  // Coffee Name Input
  coffeeNameInput: {
    borderWidth: 1,
    borderColor: Colors.stone200,
    borderRadius: 12,
    padding: 16,
    ...Typography.body,
    color: Colors.stone800,
    backgroundColor: Colors.backgroundWhite,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.stone800,
  },
  modalCloseButton: {
    ...Typography.body,
    color: Colors.stone500,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.stone100,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.stone800,
    height: '100%',
  },
  cafeList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cafeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  cafeInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  cafeName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.stone800,
    marginBottom: 4,
  },
  cafeLocation: {
    ...Typography.caption,
    color: Colors.stone500,
  },
  naverBadge: {
    backgroundColor: '#03C75A', // Naver Green
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  naverBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptySearch: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptySearchText: {
    ...Typography.body,
    color: Colors.stone400,
  },

  // Comment Input - Enhanced design from CreatePost
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.stone200,
    borderRadius: 12,
    padding: 16,
    ...Typography.body,
    color: Colors.stone800,
    backgroundColor: Colors.backgroundWhite,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.stone400,
    textAlign: 'right',
    marginTop: 8,
  },

  // Advanced Section - Enhanced with background
  advancedSection: {
    backgroundColor: Colors.stone50,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  advancedHeader: {
    marginBottom: 20,
  },
  advancedTitle: {
    fontSize: Typography.h4.fontSize,
    fontWeight: Typography.h4.fontWeight,
    color: Colors.stone700,
    marginBottom: 4,
  },
  advancedSubtitle: {
    fontSize: Typography.captionSmall.fontSize,
    color: Colors.stone500,
  },
  sliderSection: {
    marginBottom: 20,
  },
  advancedTagsSection: {
    marginTop: 4,
  },
  advancedSectionLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.label.fontWeight,
    color: Colors.stone700,
    marginBottom: 12,
  },

  // Flavor Visualization
  flavorVisualizationContainer: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.stone200,
  },

  // Roasting Buttons
  roastingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roastingButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.stone200,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
  },
  roastingButtonSelected: {
    backgroundColor: Colors.amber600,
    borderColor: Colors.amber600,
  },
  roastingButtonText: {
    ...Typography.button,
    color: Colors.stone600,
    fontWeight: '600',
  },
  roastingButtonTextSelected: {
    color: Colors.backgroundWhite,
  },

  // Advanced Toggle - Enhanced design
  advancedToggle: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.stone200,
    padding: 16,
  },
  advancedToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  advancedToggleText: {
    ...Typography.button,
    color: Colors.stone700,
  },

  // Submit Section - Enhanced button style
  submitSection: {
    marginTop: 32,
    marginBottom: 24,
  },

  // Error Display
  errorContainer: {
    backgroundColor: Colors.stone100,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
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
    backgroundColor: Colors.backgroundWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.stone800,
  },
  modalCloseButton: {
    ...Typography.button,
    color: Colors.amber600,
    fontWeight: '600',
  },
  cafeList: {
    padding: 20,
  },
  cafeItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.stone100,
  },
  cafeName: {
    ...Typography.h3,
    color: Colors.stone800,
    marginBottom: 4,
  },
  cafeLocation: {
    ...Typography.caption,
    color: Colors.stone500,
  },

  // v0.2: F-PHOTO - Photo Upload Styles
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  photoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.stone200,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoAddButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.stone300,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.stone50,
  },
  photoAddText: {
    ...Typography.captionSmall,
    color: Colors.stone500,
    marginTop: 4,
  },
});

export default WriteReviewScreen;
