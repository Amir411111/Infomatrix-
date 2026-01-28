/**
 * Zustand store для управления гардеробом
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, ClothingCategory } from '../types';

interface WardrobeState {
  items: ClothingItem[];
  isLoading: boolean;
  
  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemsByCategory: (category: ClothingCategory) => ClothingItem[];
}

const STORAGE_KEY = '@clothmatch:wardrobe';

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  isLoading: false,

  /**
   * Загружает все вещи из AsyncStorage
   */
  loadItems: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as ClothingItem[];
        set({ items, isLoading: false });
      } else {
        // Важно: если в хранилище пусто, очищаем items, иначе UI может показывать "старые" данные
        set({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error('Ошибка загрузки гардероба:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Добавляет новую вещь в гардероб
   */
  addItem: async (itemData) => {
    const newItem: ClothingItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };

    const updatedItems = [...get().items, newItem];
    set({ items: updatedItems });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Ошибка сохранения вещи:', error);
      // Откатываем изменения при ошибке
      set({ items: get().items.filter(i => i.id !== newItem.id) });
    }
  },

  /**
   * Удаляет вещь из гардероба
   */
  deleteItem: async (id: string) => {
    const currentItems = get().items;
    const updatedItems = currentItems.filter(item => item.id !== id);
    set({ items: updatedItems });

    try {
      // Если гардероб стал пустым — можно удалить ключ целиком (на web/localStorage иногда надежнее)
      if (updatedItems.length === 0) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Ошибка удаления вещи:', error);
      // Не откатываем UI при проблемах с хранилищем — иначе кажется, что удаление "не работает".
      // В MVP важнее UX; ошибку логируем.
    }
  },

  /**
   * Получает вещи по категории
   */
  getItemsByCategory: (category: ClothingCategory) => {
    return get().items.filter(item => item.category === category);
  },
}));

