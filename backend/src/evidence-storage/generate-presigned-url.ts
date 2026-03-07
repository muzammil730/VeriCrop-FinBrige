/**
 * Lambda Function: vericrop-generate-presigned-url
 * 
 * Purpose: Generate S3 presigned URLs for direct video upload from frontend
 * 
 * Why This Exists:
 * - API Gateway has a 10MB payload limit
 * - Farmer video evidence can be 50-500MB
 * - Direct S3 upload bypasses API Gateway entirely
 * - Presigned URLs provide secure, time-limited upload access
 * 
 * Architecture Flow:
 * 1. Frontend requests presigned URL from this Lambda via API Gateway
 * 2. Lambda generates secure PUT URL valid for 300 seconds (5 minutes)
 * 3. Frontend uploads video directly to S3 using presigned URL
 * 4. S3 triggers vericrop-rekognition-video-analyzer on upload completion
 * 
 * Security:
 * - Presigned URLs expire after 300 seconds
 * - S3 bucket has strict IAM policies
 * - Only allows PUT operations to /evidence/{claimId}/ prefix
 * - Content-Type validation enforced
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Initialize S3 client with AWS SDK v3
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

// Environment variables
const EVIDENCE_BUCKET = process.env.EVIDENCE_BUCKET_NAME || 'vericrop-evidence-bucket';
const PRESIGNED_URL_EXPIRY = 300; // 5 minutes in seconds

interface PresignedUrlRequest {
  claimId: string;
  filename: string;
  contentType: string;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  bucket: string;
}

/**
 * Validate content type to prevent malicious uploads
 */
function isValidContentType(contentType: string): boolean {
  const allowedTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/mpeg',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/heic',
  ];
  return allowedTypes.includes(contentType.toLowerCase());
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path separators and special characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100); // Limit filename length
}

/**
 * Generate S3 key with proper structure
 */
function generateS3Key(claimId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  return `evidence/${claimId}/${timestamp}-${sanitized}`;
}

/**
 * Main Lambda handler
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Presigned URL request received:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing request body',
          message: 'Request body must contain claimId, filename, and contentType',
        }),
      };
    }

    const request: PresignedUrlRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.claimId || !request.filename || !request.contentType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'claimId, filename, and contentType are required',
          received: {
            claimId: !!request.claimId,
            filename: !!request.filename,
            contentType: !!request.contentType,
          },
        }),
      };
    }

    // Validate content type
    if (!isValidContentType(request.contentType)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid content type',
          message: 'Only video and image files are allowed',
          allowedTypes: [
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/mpeg',
            'video/webm',
            'image/jpeg',
            'image/png',
            'image/heic',
          ],
        }),
      };
    }

    // Generate S3 key
    const s3Key = generateS3Key(request.claimId, request.filename);

    console.log('Generating presigned URL:', {
      bucket: EVIDENCE_BUCKET,
      key: s3Key,
      contentType: request.contentType,
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: EVIDENCE_BUCKET,
      Key: s3Key,
      ContentType: request.contentType,
      // Add metadata for tracking
      Metadata: {
        claimId: request.claimId,
        uploadedAt: new Date().toISOString(),
        originalFilename: request.filename,
      },
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    // Prepare response
    const response: PresignedUrlResponse = {
      uploadUrl,
      key: s3Key,
      expiresIn: PRESIGNED_URL_EXPIRY,
      bucket: EVIDENCE_BUCKET,
    };

    console.log('Presigned URL generated successfully:', {
      key: s3Key,
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Usage Example (Frontend):
 * 
 * // Step 1: Request presigned URL
 * const response = await fetch('https://api.vericrop.com/presigned-url', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     claimId: 'CLAIM-2026-12345',
 *     filename: 'field-damage.mp4',
 *     contentType: 'video/mp4'
 *   })
 * });
 * 
 * const { uploadUrl, key } = await response.json();
 * 
 * // Step 2: Upload video directly to S3
 * await fetch(uploadUrl, {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'video/mp4' },
 *   body: videoFile
 * });
 * 
 * // Step 3: S3 automatically triggers Rekognition analyzer
 * // No additional API calls needed!
 */
