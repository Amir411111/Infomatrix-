/**
 * Компонент формы для добавления новой вещи в гардероб
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobeStore } from '../store/wardrobeStore';
import { ClothingCategory } from '../types';

interface AddItemFormProps {
  onClose: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onClose }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<ClothingCategory>('Верх');
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useWardrobeStore(state => state.addItem);

  const categories: ClothingCategory[] = ['Верх', 'Низ', 'Обувь'];

  /**
   * Открывает камеру для фотографирования
   */
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на использование камеры');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть камеру');
      console.error(error);
    }
  };

  /**
   * Открывает галерею для выбора фото
   */
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть галерею');
      console.error(error);
    }
  };

  /**
   * Сохраняет вещь в гардероб
   */
  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите фото');
      return;
    }

    setIsLoading(true);
    try {
      await addItem({
        imageUri,
        category,
      });
      // Закрываем форму сразу после успешного сохранения
      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить вещь');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добавить вещь</Text>

      {/* Выбор фото */}
      <View style={styles.photoSection}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageButtonText}>Удалить фото</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={[styles.photoButton, styles.cameraButton]}
            >
              <Text style={styles.photoButtonText}>Камера</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={[styles.photoButton, styles.galleryButton]}
            >
              <Text style={styles.photoButtonText}>Галерея</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Выбор категории */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>Категория</Text>
        <View style={styles.categoryButtons}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Кнопки действий */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.actionButton, styles.cancelButton]}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.actionButton, styles.saveButton]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#111827',
  },
  photoSection: {
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 256,
    borderRadius: 8,
    marginBottom: 16,
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  photoButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#3b82f6',
  },
  galleryButton: {
    backgroundColor: '#a855f7',
  },
  photoButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#d1d5db',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#ffffff',
  },
});
