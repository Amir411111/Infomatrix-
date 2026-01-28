/**
 * Экран со списком всех вещей в гардеробе
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  StyleSheet,
} from 'react-native';
import { useWardrobeStore } from '../store/wardrobeStore';
import { ClothingItem } from '../types';
import { AddItemForm } from '../components/AddItemForm';

export const WardrobeScreen: React.FC = () => {
  const { items, loadItems, deleteItem, isLoading, clearLocalCache } = useWardrobeStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  /**
   * Очистка локального кэша
   */
  const handleClearCache = () => {
    Alert.alert(
      'Очистить кэш?',
      'Это удалит все локальные сохранения и перезагрузит данные с сервера.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLocalCache();
              Alert.alert('Успех', 'Кэш очищен и данные перезагружены');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось очистить кэш');
            }
          },
        },
      ]
    );
  };

  /**
   * Подтверждение удаления вещи
   */
  const handleDelete = (item: ClothingItem) => {
    const itemId = item._id || item.id;
    
    // RN Web не поддерживает полноценные кнопки в Alert.alert,
    // поэтому подтверждение делаем через window.confirm.
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `Удалить "${item.name}"?\n\nКатегория: ${item.category}\n\nПодтвердите удаление.`
      );
      if (ok && itemId) deleteItem(itemId);
      return;
    }

    Alert.alert(
      'Удалить вещь?',
      `Вы уверены, что хотите удалить "${item.name}" из категории "${item.category}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => itemId && deleteItem(itemId),
        },
      ]
    );
  };

  /**
   * Рендер одной вещи в списке
   */
  const renderItem = ({ item }: { item: ClothingItem }) => {
    const imageUri = item.imageBase64 || item.imageUri;
    const categoryText = item.category === 'top' ? 'Верх' : 
                        item.category === 'bottom' ? 'Низ' :
                        item.category === 'shoes' ? 'Обувь' : item.category;
    
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemContent}>
          <View>
            <Text style={styles.itemName}>{item.name || 'Вещь'}</Text>
            <Text style={styles.itemCategory}>{categoryText}</Text>
            {item.color && <Text style={styles.itemDetail}>Цвет: {item.color}</Text>}
            <Text style={styles.itemDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Мой гардероб</Text>
          <TouchableOpacity
            onPress={handleClearCache}
            style={styles.clearCacheButton}
          >
            <Text style={styles.clearCacheButtonText}>🗑️ Кэш</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Всего вещей: {items.length}
        </Text>
      </View>

      {/* Список вещей */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Гардероб пуст
            </Text>
            <Text style={styles.emptySubtext}>
              Нажмите кнопку ниже, чтобы добавить первую вещь
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
      />

      {/* Кнопка добавления */}
      <TouchableOpacity
        onPress={() => setShowAddForm(true)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Модальное окно добавления */}
      {showAddForm && (
        <View 
          style={styles.modalOverlay}
          onTouchEnd={() => setShowAddForm(false)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <AddItemForm onClose={() => setShowAddForm(false)} />
          </View>
        </View>
      )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearCacheButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clearCacheButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 192,
  },
  itemContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  itemDetail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  itemDate: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#9ca3af',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
});
