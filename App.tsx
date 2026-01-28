/**
 * Главный файл приложения ClothMatch
 * Настройка навигации и провайдеров
 */
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useWardrobeStore } from './src/store/wardrobeStore';
import { WardrobeScreen } from './src/screens/WardrobeScreen';
import { OutfitBuilderScreen } from './src/screens/OutfitBuilderScreen';
import { RecommendationsScreen } from './src/screens/RecommendationsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const loadItems = useWardrobeStore(state => state.loadItems);

  // Загружаем данные при запуске приложения
  useEffect(() => {
    loadItems().catch((error) => {
      console.error('Ошибка при загрузке данных:', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
          }}
        >
          <Tab.Screen
            name="Wardrobe"
            component={WardrobeScreen}
            options={{
              title: 'Гардероб',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <TabIcon icon="👕" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Builder"
            component={OutfitBuilderScreen}
            options={{
              title: 'Конструктор',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <TabIcon icon="✨" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Recommendations"
            component={RecommendationsScreen}
            options={{
              title: 'Рекомендации',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <TabIcon icon="🤖" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Простой компонент для иконок (можно заменить на react-native-vector-icons)
const TabIcon: React.FC<{ icon: string; color: string; size: number }> = ({
  icon,
}) => <Text style={{ fontSize: 24 }}>{icon}</Text>;
