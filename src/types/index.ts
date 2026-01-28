/**
 * Типы для приложения ClothMatch
 */

export type ClothingCategory = 'Верх' | 'Низ' | 'Обувь';

export interface ClothingItem {
  id: string;
  imageUri: string;
  category: ClothingCategory;
  createdAt: number;
}

export interface Outfit {
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
}

export interface WeatherData {
  temperature: number; // в градусах Цельсия
  isRaining: boolean;
}

export interface Recommendation {
  outfit: Outfit;
  reason: string;
}

