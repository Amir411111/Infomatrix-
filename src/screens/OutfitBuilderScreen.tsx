/**
 * Экран конструктора луков - выбор вещей из разных категорий
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useWardrobeStore } from '../store/wardrobeStore';
import { ClothingItem, ClothingCategory, Outfit } from '../types';

export const OutfitBuilderScreen: React.FC = () => {
  const { getItemsByCategory } = useWardrobeStore();
  const [outfit, setOutfit] = useState<Outfit>({});

  const tops = getItemsByCategory('Верх');
  const bottoms = getItemsByCategory('Низ');
  const shoes = getItemsByCategory('Обувь');

  /**
   * Выбор вещи для категории
   */
  const selectItem = (category: ClothingCategory, item: ClothingItem) => {
    setOutfit((prev) => ({
      ...prev,
      [category === 'Верх' ? 'top' : category === 'Низ' ? 'bottom' : 'shoes']: item,
    }));
  };

  /**
   * Очистка выбранного образа
   */
  const clearOutfit = () => {
    Alert.alert('Очистить образ?', 'Все выбранные вещи будут сброшены', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Очистить',
        style: 'destructive',
        onPress: () => setOutfit({}),
      },
    ]);
  };

  /**
   * Рендер секции выбора вещей по категории
   */
  const renderCategorySection = (
    category: ClothingCategory,
    categoryItems: ClothingItem[],
    selectedItem?: ClothingItem
  ) => {
    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{category}</Text>
        {categoryItems.length === 0 ? (
          <View style={styles.emptyCategory}>
            <Text style={styles.emptyCategoryText}>
              Нет вещей в категории "{category}"
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {categoryItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => selectItem(category, item)}
                style={[
                  styles.itemCard,
                  selectedItem?.id === item.id && styles.itemCardSelected,
                ]}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemCardImage}
                  resizeMode="cover"
                />
                {selectedItem?.id === item.id && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.selectedCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const isOutfitComplete = outfit.top && outfit.bottom && outfit.shoes;

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Конструктор луков</Text>
        <Text style={styles.headerSubtitle}>
          Выберите вещи для создания образа
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Предпросмотр образа */}
        {(outfit.top || outfit.bottom || outfit.shoes) && (
          <View style={styles.outfitPreview}>
            <Text style={styles.outfitPreviewTitle}>Ваш образ:</Text>
            <View style={styles.outfitImages}>
              {outfit.top && (
                <View style={styles.outfitImageContainer}>
                  <Image
                    source={{ uri: outfit.top.imageUri }}
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.outfitImageLabel}>Верх</Text>
                </View>
              )}
              {outfit.bottom && (
                <View style={styles.outfitImageContainer}>
                  <Image
                    source={{ uri: outfit.bottom.imageUri }}
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.outfitImageLabel}>Низ</Text>
                </View>
              )}
              {outfit.shoes && (
                <View style={styles.outfitImageContainer}>
                  <Image
                    source={{ uri: outfit.shoes.imageUri }}
                    style={styles.outfitImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.outfitImageLabel}>Обувь</Text>
                </View>
              )}
            </View>
            {isOutfitComplete && (
              <View style={styles.completeBadge}>
                <Text style={styles.completeBadgeText}>
                  ✓ Образ готов!
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={clearOutfit}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>
                Очистить образ
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Секции выбора вещей */}
        {renderCategorySection('Верх', tops, outfit.top)}
        {renderCategorySection('Низ', bottoms, outfit.bottom)}
        {renderCategorySection('Обувь', shoes, outfit.shoes)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  outfitPreview: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitPreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  outfitImages: {
    flexDirection: 'row',
    gap: 8,
  },
  outfitImageContainer: {
    flex: 1,
  },
  outfitImage: {
    width: '100%',
    height: 128,
    borderRadius: 8,
  },
  outfitImageLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  completeBadge: {
    marginTop: 16,
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
  },
  completeBadgeText: {
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#111827',
  },
  emptyCategory: {
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyCategoryText: {
    color: '#6b7280',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  itemCard: {
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  itemCardSelected: {
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  itemCardImage: {
    width: 128,
    height: 128,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmark: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
