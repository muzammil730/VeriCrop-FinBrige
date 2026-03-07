/**
 * Weather Correlation Analysis Lambda Function
 * 
 * PURPOSE: Analyze weather data against reported crop damage type to detect fraudulent claims.
 * This function compares the weather conditions (rainfall, temperature, humidity, wind speed)
 * with the reported damage type to calculate a correlation score and flag anomalies.
 * 
 * FRAUD DETECTION LOGIC:
 * - Drought damage requires low rainfall, high temperature, low humidity
 * - Flood damage requires high rainfall, high humidity
 * - Hail damage requires extreme weather events including "hail" or "storm"
 * - Storm damage requires high wind speed and extreme events
 * - Pest damage (weather-related) correlates with high humidity and moderate temperature
 * 
 * CORRELATION SCORE:
 * - 0 = No correlation (fraud likely)
 * - 50 = Partial correlation (requires HITL review)
 * - 100 = Perfect correlation (legitimate claim)
 * 
 * AWS SERVICES USED:
 * - AWS Lambda: Serverless compute for correlation analysis
 * - Amazon DynamoDB: Store correlation results
 * 
 * Requirements: 9.2
 */

// ========================================
// Type Definitions
// ========================================

interface WeatherCorrelationEvent {
  claimId: string;
  damageType: DamageType;
  weatherData: WeatherData;
}

type DamageType = 'drought' | 'flood' | 'hail' | 'storm' | 'pest' | 'disease' | 'other';

interface WeatherData {
  temperature: number;        // Celsius
  rainfall: number;           // mm in 48 hours
  humidity: number;           // percentage
  windSpeed: number;          // km/h
  cloudCover: number;         // percentage
  weatherCondition: string;   // clear, cloudy, rain, storm, etc.
  extremeEvents: string[];    // cyclone, hail, flood, drought, heavy_rainfall, heatwave
}

interface CorrelationResult {
  claimId: string;
  damageType: DamageType;
  correlationScore: number;   // 0-100
  isConsistent: boolean;      // true if score >= 50
  anomalies: string[];        // List of detected anomalies
  recommendation: 'APPROVE' | 'HITL_REVIEW' | 'REJECT';
  explanation: string;
  weatherSummary: {
    temperature: number;
    rainfall: number;
    humidity: number;
    windSpeed: number;
    extremeEvents: string[];
  };
  analyzedAt: string;
}

interface DamageTypeCorrelationRules {
  minRainfall?: number;
  maxRainfall?: number;
  minTemperature?: number;
  maxTemperature?: number;
  minHumidity?: number;
  maxHumidity?: number;
  minWindSpeed?: number;
  requiredExtremeEvents?: string[];
  description: string;
}

// ========================================
// Correlation Rules for Each Damage Type
// ========================================

const CORRELATION_RULES: Record<DamageType, DamageTypeCorrelationRules> = {
  drought: {
    maxRainfall: 10,           // Less than 10mm in 48 hours
    minTemperature: 35,        // Above 35°C
    maxHumidity: 40,           // Below 40% humidity
    requiredExtremeEvents: ['drought', 'heatwave'],
    description: 'Drought damage requires low rainfall, high temperature, and low humidity',
  },
  flood: {
    minRainfall: 100,          // More than 100mm in 48 hours
    minHumidity: 70,           // Above 70% humidity
    requiredExtremeEvents: ['heavy_rainfall', 'flood'],
    description: 'Flood damage requires high rainfall and high humidity',
  },
  hail: {
    requiredExtremeEvents: ['hail', 'storm'],
    minWindSpeed: 30,          // Hail typically comes with strong winds
    description: 'Hail damage requires extreme weather events including hail or storm',
  },
  storm: {
    minWindSpeed: 40,          // Above 40 km/h
    requiredExtremeEvents: ['storm', 'cyclone'],
    description: 'Storm damage requires high wind speed and extreme weather events',
  },
  pest: {
    minHumidity: 70,           // Above 70% humidity
    minTemperature: 25,        // Between 25-35°C
    maxTemperature: 35,
    description: 'Weather-related pest damage correlates with high humidity and moderate temperature',
  },
  disease: {
    // Disease can occur in various weather conditions, so we're lenient
    description: 'Disease damage can occur in various weather conditions',
  },
  other: {
    description: 'Other damage types require manual review',
  },
};

// ========================================
// Lambda Handler
// ========================================

export const handler = async (event: WeatherCorrelationEvent): Promise<CorrelationResult> => {
  console.log('Weather Correlation Analysis Started', {
    claimId: event.claimId,
    damageType: event.damageType,
    temperature: event.weatherData.temperature,
    rainfall: event.weatherData.rainfall,
    humidity: event.weatherData.humidity,
    windSpeed: event.weatherData.windSpeed,
    extremeEvents: event.weatherData.extremeEvents,
  });

  try {
    // Step 1: Get correlation rules for the damage type
    const rules = CORRELATION_RULES[event.damageType];

    if (!rules) {
      console.warn('Unknown damage type, defaulting to manual review', {
        claimId: event.claimId,
        damageType: event.damageType,
      });

      return {
        claimId: event.claimId,
        damageType: event.damageType,
        correlationScore: 50,
        isConsistent: true,
        anomalies: ['Unknown damage type'],
        recommendation: 'HITL_REVIEW',
        explanation: 'Unknown damage type requires manual review',
        weatherSummary: {
          temperature: event.weatherData.temperature,
          rainfall: event.weatherData.rainfall,
          humidity: event.weatherData.humidity,
          windSpeed: event.weatherData.windSpeed,
          extremeEvents: event.weatherData.extremeEvents,
        },
        analyzedAt: new Date().toISOString(),
      };
    }

    // Step 2: Calculate correlation score and detect anomalies
    const { score, anomalies } = calculateCorrelationScore(
      event.damageType,
      event.weatherData,
      rules
    );

    // Step 3: Determine recommendation based on score
    let recommendation: 'APPROVE' | 'HITL_REVIEW' | 'REJECT';
    let explanation: string;

    if (score >= 70) {
      recommendation = 'APPROVE';
      explanation = `Weather conditions strongly correlate with reported ${event.damageType} damage. ${rules.description}`;
    } else if (score >= 50) {
      recommendation = 'HITL_REVIEW';
      explanation = `Weather conditions partially correlate with reported ${event.damageType} damage. Manual review recommended. Anomalies: ${anomalies.join(', ')}`;
    } else {
      recommendation = 'REJECT';
      explanation = `Weather conditions do NOT correlate with reported ${event.damageType} damage. Potential fraud detected. Anomalies: ${anomalies.join(', ')}`;
    }

    const result: CorrelationResult = {
      claimId: event.claimId,
      damageType: event.damageType,
      correlationScore: score,
      isConsistent: score >= 50,
      anomalies,
      recommendation,
      explanation,
      weatherSummary: {
        temperature: event.weatherData.temperature,
        rainfall: event.weatherData.rainfall,
        humidity: event.weatherData.humidity,
        windSpeed: event.weatherData.windSpeed,
        extremeEvents: event.weatherData.extremeEvents,
      },
      analyzedAt: new Date().toISOString(),
    };

    console.log('Weather Correlation Analysis Completed', {
      claimId: event.claimId,
      correlationScore: score,
      recommendation,
      anomaliesCount: anomalies.length,
    });

    return result;
  } catch (error) {
    console.error('Weather Correlation Analysis Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Graceful degradation: Return neutral result to allow claim processing
    return {
      claimId: event.claimId,
      damageType: event.damageType,
      correlationScore: 50,
      isConsistent: true,
      anomalies: ['Analysis error - manual review required'],
      recommendation: 'HITL_REVIEW',
      explanation: 'Weather correlation analysis failed, manual review required',
      weatherSummary: {
        temperature: event.weatherData.temperature,
        rainfall: event.weatherData.rainfall,
        humidity: event.weatherData.humidity,
        windSpeed: event.weatherData.windSpeed,
        extremeEvents: event.weatherData.extremeEvents,
      },
      analyzedAt: new Date().toISOString(),
    };
  }
};

// ========================================
// Correlation Score Calculation
// ========================================

/**
 * Calculate correlation score between weather data and damage type
 * 
 * SCORING LOGIC:
 * - Start with base score of 100
 * - Deduct points for each rule violation
 * - Major violations (opposite conditions): -40 points
 * - Minor violations (slightly off): -20 points
 * - Missing extreme events: -30 points
 * 
 * @returns Score (0-100) and list of anomalies
 */
function calculateCorrelationScore(
  damageType: DamageType,
  weatherData: WeatherData,
  rules: DamageTypeCorrelationRules
): { score: number; anomalies: string[] } {
  let score = 100;
  const anomalies: string[] = [];

  // Special handling for disease and other types (lenient scoring)
  if (damageType === 'disease' || damageType === 'other') {
    return { score: 70, anomalies: [] };
  }

  // Check rainfall constraints
  if (rules.minRainfall !== undefined && weatherData.rainfall < rules.minRainfall) {
    const deficit = rules.minRainfall - weatherData.rainfall;
    if (deficit > 50) {
      score -= 30; // Major violation
      anomalies.push(
        `Rainfall too low: ${weatherData.rainfall}mm (expected >${rules.minRainfall}mm)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Rainfall slightly low: ${weatherData.rainfall}mm (expected >${rules.minRainfall}mm)`
      );
    }
  }

  if (rules.maxRainfall !== undefined && weatherData.rainfall > rules.maxRainfall) {
    const excess = weatherData.rainfall - rules.maxRainfall;
    if (excess > 50) {
      score -= 30; // Major violation
      anomalies.push(
        `Rainfall too high: ${weatherData.rainfall}mm (expected <${rules.maxRainfall}mm)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Rainfall slightly high: ${weatherData.rainfall}mm (expected <${rules.maxRainfall}mm)`
      );
    }
  }

  // Check temperature constraints
  if (rules.minTemperature !== undefined && weatherData.temperature < rules.minTemperature) {
    const deficit = rules.minTemperature - weatherData.temperature;
    if (deficit > 10) {
      score -= 30; // Major violation
      anomalies.push(
        `Temperature too low: ${weatherData.temperature}°C (expected >${rules.minTemperature}°C)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Temperature slightly low: ${weatherData.temperature}°C (expected >${rules.minTemperature}°C)`
      );
    }
  }

  if (rules.maxTemperature !== undefined && weatherData.temperature > rules.maxTemperature) {
    const excess = weatherData.temperature - rules.maxTemperature;
    if (excess > 10) {
      score -= 30; // Major violation
      anomalies.push(
        `Temperature too high: ${weatherData.temperature}°C (expected <${rules.maxTemperature}°C)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Temperature slightly high: ${weatherData.temperature}°C (expected <${rules.maxTemperature}°C)`
      );
    }
  }

  // Check humidity constraints
  if (rules.minHumidity !== undefined && weatherData.humidity < rules.minHumidity) {
    const deficit = rules.minHumidity - weatherData.humidity;
    if (deficit > 20) {
      score -= 30; // Major violation
      anomalies.push(
        `Humidity too low: ${weatherData.humidity}% (expected >${rules.minHumidity}%)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Humidity slightly low: ${weatherData.humidity}% (expected >${rules.minHumidity}%)`
      );
    }
  }

  if (rules.maxHumidity !== undefined && weatherData.humidity > rules.maxHumidity) {
    const excess = weatherData.humidity - rules.maxHumidity;
    if (excess > 20) {
      score -= 30; // Major violation
      anomalies.push(
        `Humidity too high: ${weatherData.humidity}% (expected <${rules.maxHumidity}%)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Humidity slightly high: ${weatherData.humidity}% (expected <${rules.maxHumidity}%)`
      );
    }
  }

  // Check wind speed constraints
  if (rules.minWindSpeed !== undefined && weatherData.windSpeed < rules.minWindSpeed) {
    const deficit = rules.minWindSpeed - weatherData.windSpeed;
    if (deficit > 20) {
      score -= 30; // Major violation
      anomalies.push(
        `Wind speed too low: ${weatherData.windSpeed} km/h (expected >${rules.minWindSpeed} km/h)`
      );
    } else {
      score -= 15; // Minor violation
      anomalies.push(
        `Wind speed slightly low: ${weatherData.windSpeed} km/h (expected >${rules.minWindSpeed} km/h)`
      );
    }
  }

  // Check extreme events
  if (rules.requiredExtremeEvents && rules.requiredExtremeEvents.length > 0) {
    const hasRequiredEvent = rules.requiredExtremeEvents.some((requiredEvent) =>
      weatherData.extremeEvents.some((actualEvent) =>
        actualEvent.toLowerCase().includes(requiredEvent.toLowerCase())
      )
    );

    if (!hasRequiredEvent) {
      // If other conditions are mostly met (score still high), be more lenient on missing events
      const currentScore = score;
      if (currentScore >= 80) {
        score -= 10; // Minor penalty if other conditions are good
      } else {
        score -= 20; // Standard penalty
      }
      anomalies.push(
        `Missing expected extreme weather events: ${rules.requiredExtremeEvents.join(' or ')}. Actual events: ${weatherData.extremeEvents.join(', ') || 'none'}`
      );
    }
  }

  // Ensure score is within bounds [0, 100]
  score = Math.max(0, Math.min(100, score));

  return { score, anomalies };
}
