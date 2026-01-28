/**
 * Типы для приложения ClothMatch
 */

export type ClothingCategory = 'Верх' | 'Низ' | 'Обувь' | 'top' | 'bottom' | 'shoes';

export interface ClothingItem {
  id?: string;
  _id?: string;
  imageUri?: string;
  name?: string;
  category: ClothingCategory;
  color?: string;
  season?: string[];
  material?: string;
  style?: string;
  condition?: string;
  imageBase64?: string;
  notes?: string;
  userId?: string;
  createdAt?: number | string;
  __v?: number;
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

