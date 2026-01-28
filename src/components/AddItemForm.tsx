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
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobeStore } from '../store/wardrobeStore';
import { ClothingCategory } from '../types';
import * as FileSystem from 'expo-file-system';

interface AddItemFormProps {
  onClose: () => void;
}

// Список предустановленных материалов
const PREDEFINED_MATERIALS = [
  'Хлопок',
  'Полиэстер',
  'Шерсть',
  'Шелк',
  'Лен',
  'Синтетика',
  'Смесь волокон',
  'Кожа',
  'Замша',
  'Джинс',
  'Вельвет',
];

export const AddItemForm: React.FC<AddItemFormProps> = ({ onClose }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<ClothingCategory>('Верх');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [customMaterial, setCustomMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [season, setSeason] = useState<string[]>(['spring', 'summer', 'autumn', 'winter']);

  const addItem = useWardrobeStore(state => state.addItem);

  const categories: ClothingCategory[] = ['Верх', 'Низ', 'Обувь'];

  const handleSelectMaterial = (mat: string) => {
    setMaterial(mat);
    setCustomMaterial('');
    setMaterialDropdownOpen(false);
  };

  const handleSelectCustom = () => {
    setMaterial('');
    setMaterialDropdownOpen(false);
  };

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

    if (!name.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название вещи');
      return;
    }

    setIsLoading(true);
    try {
      // Конвертируем изображение в base64
      let base64: string;
      if (Platform.OS === 'web') {
        // expo-file-system.readAsStringAsync недоступен на web
        // используем fetch + FileReader чтобы получить base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const commaIndex = dataUrl.indexOf(',');
            resolve(dataUrl.slice(commaIndex + 1));
          };
          reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
          reader.readAsDataURL(blob);
        });
      } else {
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Определяем category для backend (top, bottom, shoes)
      const categoryMap: { [key: string]: string } = {
        'Верх': 'top',
        'Низ': 'bottom',
        'Обувь': 'shoes',
      };

      const itemData = {
        name,
        category: categoryMap[category] as any,
        color: color || 'not specified',
        material: material || customMaterial || 'not specified',
        imageBase64: `data:image/jpeg;base64,${base64}`,
        notes,
        season: season,
        userId: 'default',
      };

      console.log('📝 Сохраняем вещь:', itemData);
      
      await addItem(itemData);

      // Закрываем форму сразу после успешного сохранения
      if (Platform.OS === 'web') {
        // window.alert на web не поддерживает колбэки, вызываем onClose после
        window.alert('Успех: вещь добавлена!');
        onClose();
      } else {
        Alert.alert('Успех', 'Вещь добавлена!', [
          {
            text: 'ОК',
            onPress: onClose,
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      Alert.alert('Ошибка', `Не удалось сохранить вещь: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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

      {/* Название */}
      <View style={styles.section}>
        <Text style={styles.label}>Название *</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Синяя рубашка"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
      </View>

      {/* Выбор категории */}
      <View style={styles.section}>
        <Text style={styles.label}>Категория *</Text>
        <View style={styles.categoryButtons}>
          {['Верх', 'Низ', 'Обувь'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat as ClothingCategory)}
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

      {/* Цвет */}
      <View style={styles.section}>
        <Text style={styles.label}>Цвет</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Синий"
          value={color}
          onChangeText={setColor}
          placeholderTextColor="#999"
        />
      </View>

      {/* Материал с dropdown */}
      <View style={styles.section}>
        <Text style={styles.label}>Материал</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setMaterialDropdownOpen(!materialDropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>
            {material || customMaterial || 'Выберите материал...'}
          </Text>
          <Text style={styles.dropdownArrow}>{materialDropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {materialDropdownOpen && (
          <View style={styles.dropdown}>
            {PREDEFINED_MATERIALS.map((mat) => (
              <TouchableOpacity
                key={mat}
                style={[
                  styles.dropdownItem,
                  material === mat && styles.dropdownItemSelected,
                ]}
                onPress={() => handleSelectMaterial(mat)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    material === mat && styles.dropdownItemTextSelected,
                  ]}
                >
                  {mat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleSelectCustom}
            >
              <Text style={styles.dropdownItemText}>+ Другое</Text>
            </TouchableOpacity>
          </View>
        )}

        {!material && (
          <TextInput
            style={styles.input}
            placeholder="Введите свой материал..."
            value={customMaterial}
            onChangeText={setCustomMaterial}
            placeholderTextColor="#999"
          />
        )}
      </View>

      {/* Заметки */}
      <View style={styles.section}>
        <Text style={styles.label}>Заметки</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Дополнительная информация..."
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#999"
          multiline
        />
      </View>

      {/* Сезоны */}
      <View style={styles.section}>
        <Text style={styles.label}>Сезоны</Text>
        <View style={styles.seasonButtons}>
          {['spring', 'summer', 'autumn', 'winter'].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => {
                setSeason((prev) =>
                  prev.includes(s)
                    ? prev.filter((item) => item !== s)
                    : [...prev, s]
                );
              }}
              style={[
                styles.seasonButton,
                season.includes(s) && styles.seasonButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.seasonButtonText,
                  season.includes(s) && styles.seasonButtonTextActive,
                ]}
              >
                {s === 'spring' ? 'Весна' : s === 'summer' ? 'Лето' : s === 'autumn' ? 'Осень' : 'Зима'}
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
    </ScrollView>
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
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  noteInput: {
    minHeight: 60,
    textAlignVertical: 'top',
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 4,
    overflow: 'hidden',
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemSelected: {
    backgroundColor: '#dbeafe',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownItemTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  seasonButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  seasonButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  seasonButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  seasonButtonText: {
    fontWeight: '600',
    color: '#374151',
    fontSize: 13,
  },
  seasonButtonTextActive: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
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
