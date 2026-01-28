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
  const { items, loadItems, deleteItem, isLoading } = useWardrobeStore();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  /**
   * Подтверждение удаления вещи
   */
  const handleDelete = (item: ClothingItem) => {
    // RN Web не поддерживает полноценные кнопки в Alert.alert,
    // поэтому подтверждение делаем через window.confirm.
    if (Platform.OS === 'web') {
      const ok = window.confirm(
        `Удалить вещь?\n\nКатегория: ${item.category}\n\nПодтвердите удаление.`
      );
      if (ok) deleteItem(item.id);
      return;
    }

    Alert.alert(
      'Удалить вещь?',
      `Вы уверены, что хотите удалить эту вещь из категории "${item.category}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteItem(item.id),
        },
      ]
    );
  };

  /**
   * Рендер одной вещи в списке
   */
  const renderItem = ({ item }: { item: ClothingItem }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <View>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
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

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Мой гардероб</Text>
        <Text style={styles.subtitle}>
          Всего вещей: {items.length}
        </Text>
      </View>

      {/* Список вещей */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowAddForm(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <AddItemForm onClose={() => setShowAddForm(false)} />
            </View>
          </TouchableOpacity>
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
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
  itemCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  itemDate: {
    color: '#6b7280',
    fontSize: 14,
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
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
  },
});
