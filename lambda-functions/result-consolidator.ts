/**
 * Result Consolidator Lambda Function
 * 
 * PURPOSE: Aggregate results from parallel forensic validation steps and calculate overall score
 * 
 * CONSOLIDATION LOGIC:
 * - Combines shadow validation, weather correlation, and AI classification results
 * - Calculates weighted overall validation score
 * - Determines fraud risk level (LOW/MEDIUM/HIGH)
 * - Makes final recommendation (APPROVED/REJECTED/HITL_REVIEW)
 * 
 * SCORING WEIGHTS:
 * - Shadow validation: 40% (critical for fraud detection)
 * - Weather correlation: 30% (validates damage authenticity)
 * - AI classification: 30% (confirms damage type)
 * 
 * Requirements: 1.1
 */

import { Handler } from 'aws-lambda';

// ========================================
// Type Definitions
// ========================================

interface ConsolidationEvent {
  claimId: string;
  shadowValidation: {
    validationStatus: string;
    fraudRiskLevel: string;
    angleVariance?: number;
    confidence: number;
  };
  weatherCorrelation: {
    correlationScore: number;
    isConsistent: boolean;
    recommendation: string;
    anomalies?: string[];
  };
  aiClassification: {
    damageType: string;
    confidence: number;
    severity: string;
    processingTime?: number;
  };
  originalClaim: any;
}

interface ConsolidatedResult {
  overallScore: number;
  validationResult: 'APPROVED' | 'REJECTED' | 'HITL_REVIEW';
  fraudRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  recommendation: string;
  details: {
    shadowScore: number;
    weatherScore: number;
    aiScore: number;
    reasons: string[];
  };
}

// ========================================
// Scoring Weights
// ========================================

const WEIGHTS = {
  SHADOW: 0.40,    // 40% - Critical for fraud detection
  WEATHER: 0.30,   // 30% - Validates damage authenticity
  AI: 0.30,        // 30% - Confirms damage type
};

const THRESHOLDS = {
  APPROVAL: 0.85,      // 85% - Minimum score for automatic approval
  REJECTION: 0.40,     // 40% - Below this is automatic rejection
  HIGH_FRAUD: 0.60,    // 60% - High fraud risk threshold
};

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<ConsolidationEvent, ConsolidatedResult> = async (
  event
) => {
  console.log('Result Consolidation Started', {
    claimId: event.claimId,
    shadowStatus: event.shadowValidation.validationStatus,
    weatherConsistent: event.weatherCorrelation.isConsistent,
    aiConfidence: event.aiClassification.confidence,
  });

  try {
    // Calculate individual component scores
    const shadowScore = calculateShadowScore(event.shadowValidation);
    const weatherScore = calculateWeatherScore(event.weatherCorrelation);
    const aiScore = calculateAIScore(event.aiClassification);

    // Calculate weighted overall score
    const overallScore = 
      (shadowScore * WEIGHTS.SHADOW) +
      (weatherScore * WEIGHTS.WEATHER) +
      (aiScore * WEIGHTS.AI);

    // Determine fraud risk level
    const fraudRisk = determineFraudRisk(
      event.shadowValidation,
      event.weatherCorrelation,
      overallScore
    );

    // Calculate overall confidence
    const confidence = calculateOverallConfidence(
      event.shadowValidation.confidence,
      event.aiClassification.confidence,
      overallScore
    );

    // Make final decision
    const { validationResult, recommendation, reasons } = makeDecision(
      overallScore,
      fraudRisk,
      confidence,
      event
    );

    const result: ConsolidatedResult = {
      overallScore: Math.round(overallScore * 100) / 100,
      validationResult,
      fraudRisk,
      confidence: Math.round(confidence * 100) / 100,
      recommendation,
      details: {
        shadowScore: Math.round(shadowScore * 100) / 100,
        weatherScore: Math.round(weatherScore * 100) / 100,
        aiScore: Math.round(aiScore * 100) / 100,
        reasons,
      },
    };

    console.log('Result Consolidation Completed', {
      claimId: event.claimId,
      overallScore: result.overallScore,
      validationResult: result.validationResult,
      fraudRisk: result.fraudRisk,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    console.error('Result Consolidation Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return safe default (route to HITL for manual review)
    return {
      overallScore: 0,
      validationResult: 'HITL_REVIEW',
      fraudRisk: 'HIGH',
      confidence: 0,
      recommendation: 'Consolidation error - requires human review',
      details: {
        shadowScore: 0,
        weatherScore: 0,
        aiScore: 0,
        reasons: ['Error during result consolidation'],
      },
    };
  }
};

// ========================================
// Scoring Functions
// ========================================

/**
 * Calculate shadow validation score (0-1)
 */
function calculateShadowScore(shadowValidation: ConsolidationEvent['shadowValidation']): number {
  // If validation status is APPROVED, high score
  if (shadowValidation.validationStatus === 'APPROVED') {
    return 1.0;
  }

  // If fraud risk is HIGH, very low score
  if (shadowValidation.fraudRiskLevel === 'HIGH') {
    return 0.2;
  }

  // If fraud risk is MEDIUM, moderate score
  if (shadowValidation.fraudRiskLevel === 'MEDIUM') {
    return 0.6;
  }

  // If fraud risk is LOW, good score
  if (shadowValidation.fraudRiskLevel === 'LOW') {
    return 0.9;
  }

  // Default: use confidence
  return shadowValidation.confidence;
}

/**
 * Calculate weather correlation score (0-1)
 */
function calculateWeatherScore(weatherCorrelation: ConsolidationEvent['weatherCorrelation']): number {
  // Convert correlation score (0-100) to (0-1)
  const baseScore = weatherCorrelation.correlationScore / 100;

  // If weather is inconsistent, reduce score
  if (!weatherCorrelation.isConsistent) {
    return Math.min(baseScore, 0.5);
  }

  // If recommendation is REJECT, very low score
  if (weatherCorrelation.recommendation === 'REJECT') {
    return 0.2;
  }

  // If recommendation is HITL_REVIEW, moderate score
  if (weatherCorrelation.recommendation === 'HITL_REVIEW') {
    return 0.6;
  }

  // If recommendation is APPROVE, use base score
  return baseScore;
}

/**
 * Calculate AI classification score (0-1)
 */
function calculateAIScore(aiClassification: ConsolidationEvent['aiClassification']): number {
  // Use AI confidence directly
  const baseScore = aiClassification.confidence;

  // Adjust based on severity (higher severity = more confident in damage)
  if (aiClassification.severity === 'HIGH') {
    return Math.min(baseScore * 1.1, 1.0);
  }

  if (aiClassification.severity === 'LOW') {
    return baseScore * 0.9;
  }

  return baseScore;
}

// ========================================
// Decision Functions
// ========================================

/**
 * Determine fraud risk level
 */
function determineFraudRisk(
  shadowValidation: ConsolidationEvent['shadowValidation'],
  weatherCorrelation: ConsolidationEvent['weatherCorrelation'],
  overallScore: number
): 'LOW' | 'MEDIUM' | 'HIGH' {
  // High fraud risk if shadow validation detected fraud
  if (shadowValidation.fraudRiskLevel === 'HIGH') {
    return 'HIGH';
  }

  // High fraud risk if weather is highly inconsistent
  if (!weatherCorrelation.isConsistent && weatherCorrelation.correlationScore < 30) {
    return 'HIGH';
  }

  // Medium fraud risk if overall score is low
  if (overallScore < THRESHOLDS.HIGH_FRAUD) {
    return 'MEDIUM';
  }

  // Low fraud risk otherwise
  return 'LOW';
}

/**
 * Calculate overall confidence
 */
function calculateOverallConfidence(
  shadowConfidence: number,
  aiConfidence: number,
  overallScore: number
): number {
  // Average of shadow and AI confidence, weighted by overall score
  const avgConfidence = (shadowConfidence + aiConfidence) / 2;
  return avgConfidence * overallScore;
}

/**
 * Make final decision
 */
function makeDecision(
  overallScore: number,
  fraudRisk: 'LOW' | 'MEDIUM' | 'HIGH',
  confidence: number,
  event: ConsolidationEvent
): {
  validationResult: 'APPROVED' | 'REJECTED' | 'HITL_REVIEW';
  recommendation: string;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Automatic rejection if fraud risk is HIGH
  if (fraudRisk === 'HIGH') {
    reasons.push('High fraud risk detected');
    reasons.push(`Shadow validation: ${event.shadowValidation.fraudRiskLevel}`);
    
    if (!event.weatherCorrelation.isConsistent) {
      reasons.push('Weather data inconsistent with damage type');
    }

    return {
      validationResult: 'REJECTED',
      recommendation: 'Claim rejected due to high fraud risk',
      reasons,
    };
  }

  // Automatic rejection if overall score is very low
  if (overallScore < THRESHOLDS.REJECTION) {
    reasons.push(`Overall validation score too low: ${(overallScore * 100).toFixed(1)}%`);
    return {
      validationResult: 'REJECTED',
      recommendation: 'Claim rejected due to low validation score',
      reasons,
    };
  }

  // Route to HITL if confidence is low
  if (confidence < THRESHOLDS.APPROVAL) {
    reasons.push(`Confidence below threshold: ${(confidence * 100).toFixed(1)}%`);
    
    if (fraudRisk === 'MEDIUM') {
      reasons.push('Medium fraud risk requires human review');
    }

    return {
      validationResult: 'HITL_REVIEW',
      recommendation: 'Low confidence - requires human review',
      reasons,
    };
  }

  // Automatic approval if all checks pass
  if (overallScore >= THRESHOLDS.APPROVAL && fraudRisk === 'LOW') {
    reasons.push(`High validation score: ${(overallScore * 100).toFixed(1)}%`);
    reasons.push('All forensic checks passed');
    reasons.push('Low fraud risk');

    return {
      validationResult: 'APPROVED',
      recommendation: 'Claim approved - proceed with certificate issuance',
      reasons,
    };
  }

  // Default: route to HITL for edge cases
  reasons.push('Borderline case requires human review');
  return {
    validationResult: 'HITL_REVIEW',
    recommendation: 'Requires human review for final decision',
    reasons,
  };
}
