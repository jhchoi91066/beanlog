// Image Service - Firebase Storage 이미지 업로드/관리
// v0.2 Feature: F-4.2 Photo Upload

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * 이미지를 Firebase Storage에 업로드
 * @param {string} uri - 로컬 이미지 URI
 * @param {string} folder - Storage 폴더 경로 (예: 'reviews', 'cafes')
 * @param {string} fileName - 파일 이름
 * @returns {Promise<string>} 업로드된 이미지의 다운로드 URL
 */
export const uploadImage = async (uri, folder, fileName) => {
  try {
    // Fetch the image as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the storage location
    const storageRef = ref(storage, `${folder}/${fileName}`);

    // Upload the image
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};

/**
 * 리뷰 이미지 업로드
 * @param {string} uri - 로컬 이미지 URI
 * @param {string} reviewId - 리뷰 ID
 * @param {number} index - 이미지 인덱스 (다중 이미지 지원)
 * @returns {Promise<string>} 다운로드 URL
 */
export const uploadReviewImage = async (uri, reviewId, index = 0) => {
  const timestamp = Date.now();
  const fileName = `${reviewId}_${index}_${timestamp}.jpg`;
  return uploadImage(uri, 'reviews', fileName);
};

/**
 * 카페 이미지 업로드
 * @param {string} uri - 로컬 이미지 URI
 * @param {string} cafeId - 카페 ID
 * @returns {Promise<string>} 다운로드 URL
 */
export const uploadCafeImage = async (uri, cafeId) => {
  const timestamp = Date.now();
  const fileName = `${cafeId}_${timestamp}.jpg`;
  return uploadImage(uri, 'cafes', fileName);
};

/**
 * Storage에서 이미지 삭제
 * @param {string} imageUrl - 삭제할 이미지의 다운로드 URL
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extract the path from the download URL
    const path = getPathFromUrl(imageUrl);
    if (!path) {
      throw new Error('Invalid image URL');
    }

    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('이미지 삭제에 실패했습니다.');
  }
};

/**
 * 다운로드 URL에서 Storage 경로 추출
 * @param {string} url - Firebase Storage 다운로드 URL
 * @returns {string|null} Storage 경로
 */
const getPathFromUrl = (url) => {
  try {
    // Firebase Storage URL format:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!url.startsWith(baseUrl)) return null;

    const pathStart = url.indexOf('/o/') + 3;
    const pathEnd = url.indexOf('?');

    if (pathStart === -1 || pathEnd === -1) return null;

    const encodedPath = url.substring(pathStart, pathEnd);
    return decodeURIComponent(encodedPath);
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * 다중 이미지 업로드 (리뷰용)
 * @param {Array<string>} uris - 이미지 URI 배열
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise<Array<string>>} 업로드된 이미지 URL 배열
 */
export const uploadMultipleReviewImages = async (uris, reviewId) => {
  try {
    const uploadPromises = uris.map((uri, index) =>
      uploadReviewImage(uri, reviewId, index)
    );

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
};

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * 이미지 압축 (클라이언트 측)
 * @param {string} uri - 원본 이미지 URI
 * @param {number} quality - 압축 품질 (0-1)
 * @returns {Promise<string>} 압축된 이미지 URI
 */
export const compressImage = async (uri, quality = 0.8) => {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Max width 1080px
      { compress: quality, format: SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Fallback to original if compression fails
  }
};

/**
 * 프로필 이미지 업로드
 * @param {string} uri - 로컬 이미지 URI
 * @param {string} uid - 유저 UID
 * @returns {Promise<string>} 다운로드 URL
 */
export const uploadProfileImage = async (uri, uid) => {
  const fileName = `profile.jpg`;
  // Store in users/{uid}/profile.jpg to overwrite previous photo automatically
  return uploadImage(uri, `users/${uid}`, fileName);
};
