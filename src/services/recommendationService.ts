/**
 * Сервис для получения рекомендаций по одежде на основе погоды
 * Имитирует запрос к AI-советнику
 */
import { ClothingItem, WeatherData, Recommendation, Outfit } from '../types';

/**
 * Алгоритм подбора одежды на основе температуры и погодных условий
 * 
 * Логика:
 * - Температура < 0°C: теплая одежда (куртки, зимние ботинки)
 * - Температура 0-10°C: осенняя/весенняя одежда (свитеры, джинсы, кроссовки)
 * - Температура 10-20°C: легкая одежда (футболки, легкие брюки)
 * - Температура > 20°C: летняя одежда (шорты, сандалии)
 * - Дождь: предпочтение закрытой обуви и верхней одежды
 */
export const getSmartRecommendation = async (
  weather: WeatherData,
  items: ClothingItem[]
): Promise<Recommendation> => {
  // Имитация задержки запроса к AI
  await new Promise(resolve => setTimeout(resolve, 1000));

  const { temperature, isRaining } = weather;
  
  // Разделяем вещи по категориям
  const tops = items.filter(item => item.category === 'Верх');
  const bottoms = items.filter(item => item.category === 'Низ');
  const shoes = items.filter(item => item.category === 'Обувь');

  const outfit: Outfit = {};
  let reason = '';

  // Подбор верха
  if (tops.length > 0) {
    if (temperature < 0) {
      // Очень холодно - выбираем случайную верхнюю одежду
      outfit.top = tops[Math.floor(Math.random() * tops.length)];
      reason += 'Холодная погода требует теплой верхней одежды. ';
    } else if (temperature < 10) {
      // Прохладно
      outfit.top = tops[Math.floor(Math.random() * tops.length)];
      reason += 'Прохладная погода - подойдет средняя верхняя одежда. ';
    } else if (temperature < 20) {
      // Умеренно
      outfit.top = tops[Math.floor(Math.random() * tops.length)];
      reason += 'Умеренная температура - легкая верхняя одежда. ';
    } else {
      // Жарко
      outfit.top = tops[Math.floor(Math.random() * tops.length)];
      reason += 'Теплая погода - легкая одежда. ';
    }
  }

  // Подбор низа
  if (bottoms.length > 0) {
    if (temperature > 20) {
      // Жарко - предпочтение шортам (если есть)
      outfit.bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      reason += 'Теплая погода - легкие брюки или шорты. ';
    } else {
      outfit.bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      reason += 'Подобраны подходящие брюки. ';
    }
  }

  // Подбор обуви
  if (shoes.length > 0) {
    if (isRaining) {
      // Дождь - закрытая обувь
      outfit.shoes = shoes[Math.floor(Math.random() * shoes.length)];
      reason += 'Дождливая погода - рекомендуется закрытая обувь. ';
    } else if (temperature > 20) {
      // Жарко - можно открытую обувь
      outfit.shoes = shoes[Math.floor(Math.random() * shoes.length)];
      reason += 'Теплая погода - подойдет любая обувь. ';
    } else {
      outfit.shoes = shoes[Math.floor(Math.random() * shoes.length)];
      reason += 'Подобрана подходящая обувь. ';
    }
  }

  // Если не удалось подобрать полный комплект
  if (!outfit.top && !outfit.bottom && !outfit.shoes) {
    reason = 'В вашем гардеробе пока нет вещей. Добавьте одежду для получения рекомендаций.';
  } else if (!outfit.top || !outfit.bottom || !outfit.shoes) {
    reason += 'Рекомендуется дополнить гардероб для более точных рекомендаций.';
  } else {
    reason = `Идеальный комплект для ${temperature}°C${isRaining ? ' с дождем' : ''}. ${reason}`;
  }

  return { outfit, reason };
};

