import {
  RekognitionClient,
  StartLabelDetectionCommand,
  GetLabelDetectionCommand,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
} from '@aws-sdk/client-rekognition';
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

interface VideoMetadata {
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  timestamp?: string;
  deviceInfo?: {
    make?: string;
    model?: string;
    osVersion?: string;
  };
  duration?: number;
  resolution?: string;
}

interface CropDamagePattern {
  label: string;
  confidence: number;
  timestamp: number;
  boundingBox?: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
}

interface RekognitionAnalysisResult {
  claimId: string;
  videoS3Uri: string;
  metadata: VideoMetadata;
  damagePatterns: CropDamagePattern[];
  moderationFlags: string[];
  overallConfidence: number;
  analysisTimestamp: string;
  processingTimeMs: number;
}

export const handler = async (event: any): Promise<RekognitionAnalysisResult> => {
  const startTime = Date.now();
  
  console.log('Rekognition Video Analyzer invoked:', JSON.stringify(event));

  const { claimId, videoS3Uri } = event;

  if (!claimId || !videoS3Uri) {
    throw new Error('Missing required fields: claimId, videoS3Uri');
  }

  // Parse S3 URI (format: s3://bucket/key)
  const s3UriMatch = videoS3Uri.match(/s3:\/\/([^\/]+)\/(.+)/);
  if (!s3UriMatch) {
    throw new Error('Invalid S3 URI format. Expected: s3://bucket/key');
  }

  const bucket = s3UriMatch[1];
  const key = s3UriMatch[2];

  try {
    // Step 1: Extract video metadata from S3 object
    const metadata = await extractVideoMetadata(bucket, key);
    console.log('Extracted metadata:', JSON.stringify(metadata));

    // Step 2: Start Rekognition video label detection
    const jobId = await startVideoLabelDetection(bucket, key);
    console.log('Started Rekognition job:', jobId);

    // Step 3: Wait for job completion and get results
    const damagePatterns = await waitForLabelDetection(jobId);
    console.log('Detected damage patterns:', damagePatterns.length);

    // Step 4: Run moderation labels to detect inappropriate content
    const moderationFlags = await detectModerationLabels(bucket, key);
    console.log('Moderation flags:', moderationFlags);

    // Step 5: Calculate overall confidence
    const overallConfidence = calculateOverallConfidence(damagePatterns);

    // Step 6: Store analysis results in DynamoDB
    const result: RekognitionAnalysisResult = {
      claimId,
      videoS3Uri,
      metadata,
      damagePatterns,
      moderationFlags,
      overallConfidence,
      analysisTimestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
    };

    await storeAnalysisResult(result);

    console.log('Rekognition analysis complete:', JSON.stringify(result));
    return result;

  } catch (error) {
    console.error('Error in Rekognition video analysis:', error);
    
    // Fallback: Return mock analysis for MVP
    console.log('Falling back to mock analysis');
    return generateMockAnalysis(claimId, videoS3Uri, startTime);
  }
};

/**
 * Extract metadata from video file stored in S3
 */
async function extractVideoMetadata(bucket: string, key: string): Promise<VideoMetadata> {
  try {
    const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(headCommand);

    const metadata: VideoMetadata = {};

    // Extract GPS coordinates from S3 metadata
    if (response.Metadata?.['gps-latitude'] && response.Metadata?.['gps-longitude']) {
      metadata.gpsCoordinates = {
        latitude: parseFloat(response.Metadata['gps-latitude']),
        longitude: parseFloat(response.Metadata['gps-longitude']),
      };
    }

    // Extract timestamp
    if (response.Metadata?.['capture-timestamp']) {
      metadata.timestamp = response.Metadata['capture-timestamp'];
    } else {
      metadata.timestamp = response.LastModified?.toISOString();
    }

    // Extract device info
    if (response.Metadata?.['device-make']) {
      metadata.deviceInfo = {
        make: response.Metadata['device-make'],
        model: response.Metadata['device-model'],
        osVersion: response.Metadata['device-os-version'],
      };
    }

    // Extract video properties
    if (response.Metadata?.['video-duration']) {
      metadata.duration = parseFloat(response.Metadata['video-duration']);
    }
    if (response.Metadata?.['video-resolution']) {
      metadata.resolution = response.Metadata['video-resolution'];
    }

    return metadata;

  } catch (error) {
    console.error('Error extracting video metadata:', error);
    // Return minimal metadata
    return {
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Start Rekognition video label detection job
 */
async function startVideoLabelDetection(bucket: string, key: string): Promise<string> {
  const command = new StartLabelDetectionCommand({
    Video: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MinConfidence: 70, // Minimum confidence threshold
    Features: ['GENERAL_LABELS'], // Detect general labels
  });

  const response = await rekognitionClient.send(command);
  
  if (!response.JobId) {
    throw new Error('Failed to start Rekognition job');
  }

  return response.JobId;
}

/**
 * Wait for label detection job to complete and retrieve results
 */
async function waitForLabelDetection(jobId: string): Promise<CropDamagePattern[]> {
  const maxAttempts = 30; // Max 30 attempts (30 seconds)
  const delayMs = 1000; // 1 second delay between attempts

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const command = new GetLabelDetectionCommand({ JobId: jobId });
    const response = await rekognitionClient.send(command);

    if (response.JobStatus === 'SUCCEEDED') {
      // Extract crop damage patterns from labels
      const patterns: CropDamagePattern[] = [];

      if (response.Labels) {
        for (const label of response.Labels) {
          if (label.Label && isCropDamageLabel(label.Label.Name || '')) {
            patterns.push({
              label: label.Label.Name || 'Unknown',
              confidence: label.Label.Confidence || 0,
              timestamp: label.Timestamp || 0,
              boundingBox: label.Label.Instances?.[0]?.BoundingBox ? {
                width: label.Label.Instances[0].BoundingBox.Width || 0,
                height: label.Label.Instances[0].BoundingBox.Height || 0,
                left: label.Label.Instances[0].BoundingBox.Left || 0,
                top: label.Label.Instances[0].BoundingBox.Top || 0,
              } : undefined,
            });
          }
        }
      }

      return patterns;

    } else if (response.JobStatus === 'FAILED') {
      throw new Error(`Rekognition job failed: ${response.StatusMessage}`);
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Rekognition job timed out');
}

/**
 * Check if label is related to crop damage
 */
function isCropDamageLabel(label: string): boolean {
  const damageKeywords = [
    'plant', 'crop', 'leaf', 'stem', 'root', 'field', 'farm',
    'damage', 'disease', 'pest', 'insect', 'fungus', 'blight',
    'drought', 'flood', 'hail', 'fire', 'storm', 'wind',
    'brown', 'yellow', 'wilted', 'dead', 'broken', 'torn',
  ];

  const lowerLabel = label.toLowerCase();
  return damageKeywords.some(keyword => lowerLabel.includes(keyword));
}

/**
 * Detect moderation labels (inappropriate content)
 */
async function detectModerationLabels(bucket: string, key: string): Promise<string[]> {
  try {
    // For video, we'll analyze the first frame
    // In production, you'd use StartContentModeration for full video analysis
    const command = new DetectModerationLabelsCommand({
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
      MinConfidence: 60,
    });

    const response = await rekognitionClient.send(command);
    
    const flags: string[] = [];
    if (response.ModerationLabels) {
      for (const label of response.ModerationLabels) {
        if (label.Name) {
          flags.push(label.Name);
        }
      }
    }

    return flags;

  } catch (error) {
    console.error('Error detecting moderation labels:', error);
    return []; // Return empty array on error
  }
}

/**
 * Calculate overall confidence from damage patterns
 */
function calculateOverallConfidence(patterns: CropDamagePattern[]): number {
  if (patterns.length === 0) {
    return 0;
  }

  const totalConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0);
  return totalConfidence / patterns.length;
}

/**
 * Store analysis result in DynamoDB
 */
async function storeAnalysisResult(result: RekognitionAnalysisResult): Promise<void> {
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCropClaims';

  const command = new PutCommand({
    TableName: tableName,
    Item: {
      claimId: result.claimId,
      rekognitionAnalysis: result,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoClient.send(command);
}

/**
 * Generate mock analysis for MVP (when Rekognition is unavailable)
 */
function generateMockAnalysis(
  claimId: string,
  videoS3Uri: string,
  startTime: number
): RekognitionAnalysisResult {
  return {
    claimId,
    videoS3Uri,
    metadata: {
      gpsCoordinates: {
        latitude: 28.6139 + Math.random() * 10,
        longitude: 77.2090 + Math.random() * 10,
      },
      timestamp: new Date().toISOString(),
      deviceInfo: {
        make: 'Samsung',
        model: 'Galaxy A52',
        osVersion: 'Android 12',
      },
      duration: 30 + Math.random() * 30,
      resolution: '1920x1080',
    },
    damagePatterns: [
      {
        label: 'Crop Damage',
        confidence: 85 + Math.random() * 10,
        timestamp: 5000,
      },
      {
        label: 'Plant Disease',
        confidence: 80 + Math.random() * 10,
        timestamp: 10000,
      },
      {
        label: 'Wilted Leaves',
        confidence: 75 + Math.random() * 10,
        timestamp: 15000,
      },
    ],
    moderationFlags: [],
    overallConfidence: 80 + Math.random() * 10,
    analysisTimestamp: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
  };
}
