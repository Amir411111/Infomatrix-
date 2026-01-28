/**
 * Экран с AI-рекомендациями на основе погоды
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { getSmartRecommendation } from '../services/recommendationService';
import { useWardrobeStore } from '../store/wardrobeStore';
import { WeatherData, Recommendation } from '../types';
import * as Location from 'expo-location';
import { getWeatherByLocation } from '../services/weatherService';

export const RecommendationsScreen: React.FC = () => {
  const { items } = useWardrobeStore();
  const [temperature, setTemperature] = useState<string>(''); // Start empty to show loading/fetching state or placeholder
  const [isRaining, setIsRaining] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsWeatherLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          setIsWeatherLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const weather = await getWeatherByLocation(
          location.coords.latitude,
          location.coords.longitude
        );

        setTemperature(weather.temperature.toString());
        setIsRaining(weather.isRaining);

        // Auto-fetch recommendation if we have items
        if (items.length > 0) {
          // Slight delay to ensure state updates or just call logic directly
          // For now, let's just populate fields. User can click "Get Recommendation" or we can auto-trigger.
          // Let's auto-trigger to "wow" the user as requested.
          handleAutoRecommendation(weather.temperature, weather.isRaining);
        }

      } catch (error) {
        console.error('Error fetching weather/location:', error);
        setLocationError('Could not fetch weather data');
      } finally {
        setIsWeatherLoading(false);
      }
    })();
  }, [items.length]); // Dependency on items.length to retry auto-rec if items are added? Maybe just [] is safer to avoid loops. Using [] for now.

  const handleAutoRecommendation = async (temp: number, raining: boolean) => {
    setIsLoading(true);
    try {
      const result = await getSmartRecommendation({ temperature: temp, isRaining: raining }, items);
      setRecommendation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Получение рекомендации от AI-советника (Manual trigger)
   */
  const handleGetRecommendation = async () => {
    const temp = parseFloat(temperature);

    if (isNaN(temp)) {
      Alert.alert('Ошибка', 'Введите корректную температуру');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте вещи в гардероб для получения рекомендаций');
      return;
    }

    setIsLoading(true);
    try {
      const weather: WeatherData = {
        temperature: temp,
        isRaining,
      };

      const result = await getSmartRecommendation(weather, items);
      setRecommendation(result);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить рекомендацию');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI-Рекомендации</Text>
        <Text style={styles.headerSubtitle}>
          Получите совет по выбору одежды на основе погоды
        </Text>
      </View>

      {/* Форма ввода погоды */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Погодные условия</Text>

        {locationError && (
          <Text style={{ color: 'red', marginBottom: 10 }}>{locationError}</Text>
        )}

        {/* Температура */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            Температура (°C)
            {isWeatherLoading && <ActivityIndicator size="small" color="#3b82f6" style={{ marginLeft: 10 }} />}
          </Text>
          <TextInput
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
            placeholder={isWeatherLoading ? "Загрузка..." : "20"}
            style={styles.textInput}
          />
        </View>

        {/* Дождь */}
        <View style={styles.checkboxSection}>
          <TouchableOpacity
            onPress={() => setIsRaining(!isRaining)}
            style={[
              styles.checkboxContainer,
              isRaining && styles.checkboxContainerActive,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                isRaining && styles.checkboxActive,
              ]}
            >
              {isRaining && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Идет дождь</Text>
          </TouchableOpacity>
        </View>

        {/* Кнопка получения рекомендации */}
        <TouchableOpacity
          onPress={handleGetRecommendation}
          disabled={isLoading}
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              Получить рекомендацию
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Результат рекомендации */}
      {recommendation && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Рекомендуемый образ</Text>

          {/* Причина рекомендации */}
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>{recommendation.reason}</Text>
          </View>

          {/* Визуализация образа */}
          {(recommendation.outfit.top ||
            recommendation.outfit.bottom ||
            recommendation.outfit.shoes) && (
              <View>
                <Text style={styles.outfitTitle}>Комплект:</Text>
                <View style={styles.outfitImages}>
                  {recommendation.outfit.top && (
                    <View style={styles.outfitImageContainer}>
                      <Image
                        source={{ uri: recommendation.outfit.top.imageUri }}
                        style={styles.outfitImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.outfitImageLabel}>Верх</Text>
                    </View>
                  )}
                  {recommendation.outfit.bottom && (
                    <View style={styles.outfitImageContainer}>
                      <Image
                        source={{ uri: recommendation.outfit.bottom.imageUri }}
                        style={styles.outfitImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.outfitImageLabel}>Низ</Text>
                    </View>
                  )}
                  {recommendation.outfit.shoes && (
                    <View style={styles.outfitImageContainer}>
                      <Image
                        source={{ uri: recommendation.outfit.shoes.imageUri }}
                        style={styles.outfitImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.outfitImageLabel}>Обувь</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

          {!recommendation.outfit.top &&
            !recommendation.outfit.bottom &&
            !recommendation.outfit.shoes && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Не удалось подобрать комплект. Добавьте больше вещей в гардероб.
                </Text>
              </View>
            )}
        </View>
      )}
    </ScrollView>
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
  formContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    marginBottom: 8,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    backgroundColor: '#ffffff',
  },
  checkboxSection: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  checkboxContainerActive: {
    backgroundColor: '#dbeafe',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9ca3af',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 18,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  reasonContainer: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  reasonText: {
    color: '#1e3a8a',
    fontSize: 16,
  },
  outfitTitle: {
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
  warningContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
  },
  warningText: {
    color: '#92400e',
    textAlign: 'center',
    fontSize: 16,
  },
});
