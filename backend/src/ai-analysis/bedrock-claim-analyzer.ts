/**
 * Amazon Bedrock Claim Analyzer Lambda Function
 * 
 * PURPOSE: Use Bedrock Claude 3 to provide explainable AI analysis of crop damage claims
 * 
 * BEDROCK FEATURES:
 * - Natural language explanations in Hindi
 * - Fraud pattern detection
 * - Confidence scoring
 * - Regulatory compliance (explainable AI)
 * 
 * Requirements: Hackathon requirement for Amazon Bedrock usage
 */

import { Handler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// ========================================
// Type Definitions
// ========================================

interface ClaimAnalysisRequest {
  claimId: string;
  farmerId: string;
  damageType: string;
  damageAmount: number;
  gpsLocation: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  forensicResults: {
    solarAzimuthVariance: number;
    weatherCorrelationScore: number;
    aiClassificationConfidence: number;
    shadowAngleMatch: boolean;
  };
}

interface BedrockAnalysisResult {
  recommendation: 'APPROVE' | 'REJECT' | 'HITL_REVIEW';
  confidence: number;
  explanationEnglish: string;
  explanationHindi: string;
  fraudIndicators: string[];
  reasoning: string;
}

// ========================================
// Constants
// ========================================

const BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'; // Claude 3 Sonnet
const MAX_TOKENS = 1000;
const TEMPERATURE = 0.3; // Lower temperature for more consistent analysis

// ========================================
// Lambda Handler
// ========================================

export const handler: Handler<ClaimAnalysisRequest, BedrockAnalysisResult> = async (event) => {
  console.log('Bedrock Claim Analysis Started', {
    claimId: event.claimId,
    damageType: event.damageType,
    damageAmount: event.damageAmount,
  });

  try {
    // Prepare prompt for Bedrock
    const prompt = buildAnalysisPrompt(event);

    // Invoke Bedrock Claude 3
    const analysis = await invokeBedrockModel(prompt);

    // Parse and structure the response
    const result = parseBedrockResponse(analysis, event);

    console.log('Bedrock Analysis Completed', {
      claimId: event.claimId,
      recommendation: result.recommendation,
      confidence: result.confidence,
    });

    return result;
  } catch (error) {
    console.error('Bedrock Analysis Failed', {
      claimId: event.claimId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback to rule-based analysis if Bedrock fails
    return fallbackAnalysis(event);
  }
};

// ========================================
// Helper Functions
// ========================================

/**
 * Build analysis prompt for Bedrock Claude 3
 */
function buildAnalysisPrompt(claim: ClaimAnalysisRequest): string {
  return `You are an expert agricultural insurance claim analyst for VeriCrop FinBridge. Analyze this crop damage claim and provide a recommendation.

CLAIM DETAILS:
- Claim ID: ${claim.claimId}
- Farmer ID: ${claim.farmerId}
- Damage Type: ${claim.damageType}
- Damage Amount: ₹${claim.damageAmount.toLocaleString('en-IN')}
- GPS Location: ${claim.gpsLocation.latitude}, ${claim.gpsLocation.longitude}
- Timestamp: ${claim.timestamp}

FORENSIC VALIDATION RESULTS:
- Solar Azimuth Variance: ${claim.forensicResults.solarAzimuthVariance.toFixed(2)}° (threshold: ±5°)
- Weather Correlation Score: ${claim.forensicResults.weatherCorrelationScore}/100
- AI Classification Confidence: ${(claim.forensicResults.aiClassificationConfidence * 100).toFixed(1)}%
- Shadow Angle Match: ${claim.forensicResults.shadowAngleMatch ? 'YES' : 'NO'}

ANALYSIS INSTRUCTIONS:
1. Evaluate the forensic evidence for fraud indicators
2. Consider: shadow angle variance, weather patterns, AI confidence
3. Provide recommendation: APPROVE, REJECT, or HITL_REVIEW
4. Explain your reasoning in simple language
5. Provide explanation in both English and Hindi

FRAUD INDICATORS TO CHECK:
- Solar azimuth variance >5° suggests manipulated timestamp or GPS
- Weather correlation <60 suggests damage type doesn't match weather
- AI confidence <70% suggests unclear or staged damage
- Shadow angle mismatch suggests video was not taken at claimed time/location

OUTPUT FORMAT (JSON):
{
  "recommendation": "APPROVE|REJECT|HITL_REVIEW",
  "confidence": 0.95,
  "explanationEnglish": "Clear explanation in English",
  "explanationHindi": "स्पष्ट व्याख्या हिंदी में",
  "fraudIndicators": ["List of any fraud indicators found"],
  "reasoning": "Detailed reasoning for the recommendation"
}

Provide your analysis now:`;
}

/**
 * Invoke Bedrock Claude 3 model
 */
async function invokeBedrockModel(prompt: string): Promise<string> {
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  console.log('Invoking Bedrock Model', {
    modelId: BEDROCK_MODEL_ID,
    promptLength: prompt.length,
  });

  const response = await bedrockClient.send(command);

  // Parse response
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const analysisText = responseBody.content[0].text;

  console.log('Bedrock Response Received', {
    responseLength: analysisText.length,
    stopReason: responseBody.stop_reason,
  });

  return analysisText;
}

/**
 * Parse Bedrock response and extract structured data
 */
function parseBedrockResponse(
  analysisText: string,
  claim: ClaimAnalysisRequest
): BedrockAnalysisResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendation: parsed.recommendation || 'HITL_REVIEW',
        confidence: parsed.confidence || 0.5,
        explanationEnglish: parsed.explanationEnglish || analysisText,
        explanationHindi: parsed.explanationHindi || 'विश्लेषण उपलब्ध नहीं है',
        fraudIndicators: parsed.fraudIndicators || [],
        reasoning: parsed.reasoning || analysisText,
      };
    }

    // Fallback: Use the entire text as explanation
    return {
      recommendation: determineRecommendation(claim),
      confidence: 0.7,
      explanationEnglish: analysisText,
      explanationHindi: 'कृपया अंग्रेजी व्याख्या देखें',
      fraudIndicators: extractFraudIndicators(claim),
      reasoning: analysisText,
    };
  } catch (error) {
    console.error('Failed to parse Bedrock response', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return fallbackAnalysis(claim);
  }
}

/**
 * Determine recommendation based on forensic results
 */
function determineRecommendation(claim: ClaimAnalysisRequest): 'APPROVE' | 'REJECT' | 'HITL_REVIEW' {
  const { forensicResults } = claim;

  // REJECT if clear fraud indicators
  if (
    Math.abs(forensicResults.solarAzimuthVariance) > 10 ||
    !forensicResults.shadowAngleMatch
  ) {
    return 'REJECT';
  }

  // APPROVE if all checks pass
  if (
    Math.abs(forensicResults.solarAzimuthVariance) <= 5 &&
    forensicResults.weatherCorrelationScore >= 70 &&
    forensicResults.aiClassificationConfidence >= 0.85 &&
    forensicResults.shadowAngleMatch
  ) {
    return 'APPROVE';
  }

  // HITL_REVIEW for borderline cases
  return 'HITL_REVIEW';
}

/**
 * Extract fraud indicators from forensic results
 */
function extractFraudIndicators(claim: ClaimAnalysisRequest): string[] {
  const indicators: string[] = [];
  const { forensicResults } = claim;

  if (Math.abs(forensicResults.solarAzimuthVariance) > 5) {
    indicators.push(`Solar azimuth variance ${forensicResults.solarAzimuthVariance.toFixed(2)}° exceeds ±5° threshold`);
  }

  if (forensicResults.weatherCorrelationScore < 60) {
    indicators.push(`Low weather correlation score: ${forensicResults.weatherCorrelationScore}/100`);
  }

  if (forensicResults.aiClassificationConfidence < 0.7) {
    indicators.push(`Low AI classification confidence: ${(forensicResults.aiClassificationConfidence * 100).toFixed(1)}%`);
  }

  if (!forensicResults.shadowAngleMatch) {
    indicators.push('Shadow angle does not match expected direction');
  }

  return indicators;
}

/**
 * Fallback analysis if Bedrock fails
 */
function fallbackAnalysis(claim: ClaimAnalysisRequest): BedrockAnalysisResult {
  const recommendation = determineRecommendation(claim);
  const fraudIndicators = extractFraudIndicators(claim);

  let explanationEnglish = '';
  let explanationHindi = '';

  if (recommendation === 'APPROVE') {
    explanationEnglish = `Claim approved. All forensic checks passed: shadow angle matches (±${Math.abs(claim.forensicResults.solarAzimuthVariance).toFixed(2)}°), weather correlation is ${claim.forensicResults.weatherCorrelationScore}/100, and AI confidence is ${(claim.forensicResults.aiClassificationConfidence * 100).toFixed(1)}%.`;
    explanationHindi = `दावा स्वीकृत। सभी फोरेंसिक जांच पास: छाया कोण मेल खाता है, मौसम सहसंबंध ${claim.forensicResults.weatherCorrelationScore}/100 है, और AI विश्वास ${(claim.forensicResults.aiClassificationConfidence * 100).toFixed(1)}% है।`;
  } else if (recommendation === 'REJECT') {
    explanationEnglish = `Claim rejected due to fraud indicators: ${fraudIndicators.join(', ')}. The evidence suggests the claim may have been manipulated.`;
    explanationHindi = `धोखाधड़ी संकेतकों के कारण दावा अस्वीकृत: ${fraudIndicators.length} समस्याएं पाई गईं। साक्ष्य से पता चलता है कि दावा में हेरफेर किया गया हो सकता है।`;
  } else {
    explanationEnglish = `Claim requires human review. Some forensic checks are borderline: ${fraudIndicators.length > 0 ? fraudIndicators.join(', ') : 'mixed results'}. A human expert will review the evidence.`;
    explanationHindi = `दावे की मानव समीक्षा आवश्यक है। कुछ फोरेंसिक जांच सीमा रेखा पर हैं। एक मानव विशेषज्ञ साक्ष्य की समीक्षा करेगा।`;
  }

  return {
    recommendation,
    confidence: 0.75,
    explanationEnglish,
    explanationHindi,
    fraudIndicators,
    reasoning: `Fallback analysis based on forensic thresholds. ${fraudIndicators.length} fraud indicators detected.`,
  };
}
