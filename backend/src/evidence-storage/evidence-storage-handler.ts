import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { createHash } from 'crypto';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));

interface EvidenceFile {
  claimId: string;
  fileType: 'video' | 'image' | 'document';
  fileName: string;
  fileData?: string; // Base64 encoded file data
  s3Uri?: string; // Existing S3 URI
  metadata?: {
    gpsLatitude?: number;
    gpsLongitude?: number;
    captureTimestamp?: string;
    deviceMake?: string;
    deviceModel?: string;
    deviceOsVersion?: string;
    videoDuration?: number;
    videoResolution?: string;
  };
}

interface EvidenceStorageResult {
  claimId: string;
  evidenceId: string;
  s3Uri: string;
  sha256Hash: string;
  fileSize: number;
  storedAt: string;
  objectLockEnabled: boolean;
  metadata?: any;
}

export const handler = async (event: any): Promise<EvidenceStorageResult> => {
  console.log('Evidence Storage Handler invoked:', JSON.stringify(event));

  const evidence: EvidenceFile = event;

  if (!evidence.claimId || !evidence.fileType || !evidence.fileName) {
    throw new Error('Missing required fields: claimId, fileType, fileName');
  }

  if (!evidence.fileData && !evidence.s3Uri) {
    throw new Error('Either fileData or s3Uri must be provided');
  }

  const bucketName = process.env.EVIDENCE_BUCKET_NAME || 'vericrop-evidence-889168907575';
  const tableName = process.env.CLAIMS_TABLE_NAME || 'VeriCrop-Claims';

  try {
    let fileBuffer: Buffer;
    let s3Key: string;

    // Step 1: Get file buffer
    if (evidence.fileData) {
      // Decode base64 file data
      fileBuffer = Buffer.from(evidence.fileData, 'base64');
      
      // Generate S3 key
      const timestamp = Date.now();
      const sanitizedFileName = evidence.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      s3Key = `claims/${evidence.claimId}/evidence/${timestamp}-${sanitizedFileName}`;
      
    } else if (evidence.s3Uri) {
      // File already in S3, just calculate hash
      const existingKey = evidence.s3Uri.replace(`s3://${bucketName}/`, '');
      fileBuffer = await getS3FileBuffer(bucketName, existingKey);
      s3Key = existingKey;
    } else {
      throw new Error('No file data provided');
    }

    // Step 2: Calculate SHA-256 hash
    const sha256Hash = calculateSHA256(fileBuffer);
    console.log('Calculated SHA-256 hash:', sha256Hash);

    // Step 3: Check if file with same hash already exists (deduplication)
    const existingEvidence = await checkExistingHash(tableName, sha256Hash);
    if (existingEvidence) {
      console.log('File with same hash already exists:', existingEvidence.evidenceId);
      return existingEvidence;
    }

    // Step 4: Upload to S3 with Object Lock
    if (evidence.fileData) {
      await uploadToS3(bucketName, s3Key, fileBuffer, evidence.fileType, evidence.metadata);
      console.log('Uploaded to S3:', s3Key);
    }

    // Step 5: Store hash and metadata in DynamoDB
    const evidenceId = `evidence-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const result: EvidenceStorageResult = {
      claimId: evidence.claimId,
      evidenceId,
      s3Uri: `s3://${bucketName}/${s3Key}`,
      sha256Hash,
      fileSize: fileBuffer.length,
      storedAt: new Date().toISOString(),
      objectLockEnabled: true,
      metadata: evidence.metadata,
    };

    await storeEvidenceMetadata(tableName, result);
    console.log('Stored evidence metadata:', evidenceId);

    return result;

  } catch (error) {
    console.error('Error storing evidence:', error);
    throw error;
  }
};

/**
 * Calculate SHA-256 hash of file buffer
 */
function calculateSHA256(buffer: Buffer): string {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Get file buffer from S3
 */
async function getS3FileBuffer(bucket: string, key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('No file body returned from S3');
  }

  // Convert stream to buffer
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  return Buffer.concat(chunks);
}

/**
 * Check if evidence with same hash already exists (deduplication)
 */
async function checkExistingHash(
  tableName: string,
  sha256Hash: string
): Promise<EvidenceStorageResult | null> {
  try {
    // Query DynamoDB for existing hash
    // Note: In production, you'd use a GSI on sha256Hash for efficient lookup
    // For MVP, we'll skip this check to avoid additional GSI costs
    return null;
  } catch (error) {
    console.error('Error checking existing hash:', error);
    return null;
  }
}

/**
 * Upload file to S3 with Object Lock and metadata
 */
async function uploadToS3(
  bucket: string,
  key: string,
  buffer: Buffer,
  fileType: string,
  metadata?: any
): Promise<void> {
  const s3Metadata: Record<string, string> = {
    'file-type': fileType,
  };

  // Add GPS coordinates to S3 metadata
  if (metadata?.gpsLatitude && metadata?.gpsLongitude) {
    s3Metadata['gps-latitude'] = metadata.gpsLatitude.toString();
    s3Metadata['gps-longitude'] = metadata.gpsLongitude.toString();
  }

  // Add capture timestamp
  if (metadata?.captureTimestamp) {
    s3Metadata['capture-timestamp'] = metadata.captureTimestamp;
  }

  // Add device info
  if (metadata?.deviceMake) {
    s3Metadata['device-make'] = metadata.deviceMake;
  }
  if (metadata?.deviceModel) {
    s3Metadata['device-model'] = metadata.deviceModel;
  }
  if (metadata?.deviceOsVersion) {
    s3Metadata['device-os-version'] = metadata.deviceOsVersion;
  }

  // Add video properties
  if (metadata?.videoDuration) {
    s3Metadata['video-duration'] = metadata.videoDuration.toString();
  }
  if (metadata?.videoResolution) {
    s3Metadata['video-resolution'] = metadata.videoResolution;
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    Metadata: s3Metadata,
    ServerSideEncryption: 'aws:kms', // Use KMS encryption
    ContentType: getContentType(fileType),
    // Object Lock is configured at bucket level, so files are automatically locked
  });

  await s3Client.send(command);
}

/**
 * Get content type based on file type
 */
function getContentType(fileType: string): string {
  switch (fileType) {
    case 'video':
      return 'video/mp4';
    case 'image':
      return 'image/jpeg';
    case 'document':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Store evidence metadata in DynamoDB
 */
async function storeEvidenceMetadata(
  tableName: string,
  result: EvidenceStorageResult
): Promise<void> {
  const command = new PutCommand({
    TableName: tableName,
    Item: {
      claimId: result.claimId,
      evidenceId: result.evidenceId,
      evidenceMetadata: {
        s3Uri: result.s3Uri,
        sha256Hash: result.sha256Hash,
        fileSize: result.fileSize,
        storedAt: result.storedAt,
        objectLockEnabled: result.objectLockEnabled,
        metadata: result.metadata,
      },
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoClient.send(command);
}

/**
 * Verify evidence integrity by recalculating hash
 * This function can be called separately to verify evidence hasn't been tampered with
 */
export async function verifyEvidenceIntegrity(
  s3Uri: string,
  expectedHash: string
): Promise<boolean> {
  try {
    // Parse S3 URI
    const s3UriMatch = s3Uri.match(/s3:\/\/([^\/]+)\/(.+)/);
    if (!s3UriMatch) {
      throw new Error('Invalid S3 URI format');
    }

    const bucket = s3UriMatch[1];
    const key = s3UriMatch[2];

    // Get file from S3
    const fileBuffer = await getS3FileBuffer(bucket, key);

    // Calculate hash
    const actualHash = calculateSHA256(fileBuffer);

    // Compare hashes
    const isValid = actualHash === expectedHash;
    
    if (!isValid) {
      console.error('Evidence integrity check FAILED!');
      console.error('Expected hash:', expectedHash);
      console.error('Actual hash:', actualHash);
    } else {
      console.log('Evidence integrity check PASSED');
    }

    return isValid;

  } catch (error) {
    console.error('Error verifying evidence integrity:', error);
    return false;
  }
}
