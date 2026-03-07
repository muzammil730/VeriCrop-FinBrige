# Presigned URL Implementation for Video Upload

## Problem Statement

**API Gateway Limitation:** API Gateway has a **10MB payload limit** for HTTP requests. Farmer video evidence files are typically **50-500MB**, making direct upload through API Gateway impossible.

**Traditional Workaround:** Chunked uploads or multipart uploads add complexity and require multiple API calls, increasing latency and failure points.

## Solution: S3 Presigned URLs

### Architecture

```
┌─────────────┐     1. Request URL      ┌──────────────────┐
│   Frontend  │ ───────────────────────> │  API Gateway     │
│   (React)   │                          │  POST /presigned │
└─────────────┘                          └──────────────────┘
       │                                          │
       │                                          ▼
       │                                 ┌──────────────────┐
       │                                 │  Lambda Function │
       │                                 │  generate-       │
       │                                 │  presigned-url   │
       │                                 └──────────────────┘
       │                                          │
       │         2. Presigned URL                 │
       │         (valid 5 minutes)                │
       │ <────────────────────────────────────────┘
       │
       │         3. Direct Upload
       │         (bypasses API Gateway)
       ▼
┌─────────────┐
│  S3 Bucket  │
│  Evidence   │
└─────────────┘
       │
       │         4. S3 Event Trigger
       ▼
┌─────────────┐
│  Lambda     │
│  Rekognition│
│  Analyzer   │
└─────────────┘
```

### Benefits

1. **No Size Limit:** S3 supports files up to 5TB
2. **No API Gateway Bottleneck:** Direct upload to S3
3. **Secure:** Time-limited URLs (5 minutes)
4. **Fast:** Single HTTP PUT request
5. **Cost-Effective:** No data transfer through Lambda/API Gateway

## Implementation Details

### Lambda Function: `vericrop-generate-presigned-url`

**Input:**
```json
{
  "claimId": "CLAIM-2026-12345",
  "filename": "field-damage.mp4",
  "contentType": "video/mp4"
}
```

**Output:**
```json
{
  "uploadUrl": "https://vericrop-evidence-bucket.s3.ap-south-1.amazonaws.com/evidence/CLAIM-2026-12345/1709876543210-field-damage.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  "key": "evidence/CLAIM-2026-12345/1709876543210-field-damage.mp4",
  "expiresIn": 300,
  "bucket": "vericrop-evidence-bucket"
}
```

### Security Features

1. **Content-Type Validation:** Only allows video and image MIME types
2. **Filename Sanitization:** Prevents path traversal attacks
3. **Time-Limited URLs:** Expires after 5 minutes
4. **S3 Key Structure:** `evidence/{claimId}/{timestamp}-{filename}`
5. **Metadata Tracking:** Stores claimId, uploadedAt, originalFilename

### Allowed Content Types

- `video/mp4` (most common)
- `video/quicktime` (iPhone)
- `video/x-msvideo` (AVI)
- `video/mpeg` (MPEG)
- `video/webm` (WebM)
- `image/jpeg` (JPEG photos)
- `image/png` (PNG photos)
- `image/heic` (iPhone photos)

## Frontend Integration

### Step 1: Request Presigned URL

```typescript
const requestPresignedUrl = async (
  claimId: string,
  file: File
): Promise<{ uploadUrl: string; key: string }> => {
  const response = await fetch(
    'https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/presigned-url',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimId,
        filename: file.name,
        contentType: file.type,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get presigned URL');
  }

  return response.json();
};
```

### Step 2: Upload File Directly to S3

```typescript
const uploadToS3 = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = (event.loaded / event.total) * 100;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};
```

### Step 3: Complete Upload Flow

```typescript
const handleVideoUpload = async (file: File) => {
  try {
    setUploadStatus('requesting-url');
    
    // Step 1: Get presigned URL
    const { uploadUrl, key } = await requestPresignedUrl(claimId, file);
    
    setUploadStatus('uploading');
    
    // Step 2: Upload directly to S3
    await uploadToS3(uploadUrl, file, (percent) => {
      setUploadProgress(percent);
    });
    
    setUploadStatus('complete');
    setS3Key(key); // Store for claim submission
    
    // Step 3: S3 automatically triggers Rekognition analyzer
    // No additional API calls needed!
    
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadStatus('error');
  }
};
```

## CDK Infrastructure Update

### Add Lambda Function

```typescript
// lambda-functions/generate-presigned-url.ts
const generatePresignedUrlLambda = new lambda.Function(this, 'GeneratePresignedUrl', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'generate-presigned-url.handler',
  code: lambda.Code.fromAsset('lambda-functions/dist'),
  environment: {
    EVIDENCE_BUCKET_NAME: evidenceBucket.bucketName,
  },
  timeout: cdk.Duration.seconds(10),
  memorySize: 256,
});

// Grant S3 permissions
evidenceBucket.grantPut(generatePresignedUrlLambda);
```

### Add API Gateway Endpoint

```typescript
// POST /presigned-url
const presignedUrlIntegration = new apigateway.LambdaIntegration(
  generatePresignedUrlLambda
);

api.root.addResource('presigned-url').addMethod('POST', presignedUrlIntegration, {
  authorizationType: apigateway.AuthorizationType.NONE, // Add Cognito auth in production
});
```

## Testing

### Test Event (Lambda Console)

```json
{
  "body": "{\"claimId\":\"CLAIM-2026-TEST\",\"filename\":\"test-video.mp4\",\"contentType\":\"video/mp4\"}"
}
```

### Expected Response

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"uploadUrl\":\"https://...\",\"key\":\"evidence/CLAIM-2026-TEST/...\",\"expiresIn\":300,\"bucket\":\"vericrop-evidence-bucket\"}"
}
```

### Test Upload with cURL

```bash
# Step 1: Get presigned URL
RESPONSE=$(curl -X POST \
  https://eig9hhfbk0.execute-api.ap-south-1.amazonaws.com/prod/presigned-url \
  -H 'Content-Type: application/json' \
  -d '{
    "claimId": "CLAIM-2026-TEST",
    "filename": "test-video.mp4",
    "contentType": "video/mp4"
  }')

UPLOAD_URL=$(echo $RESPONSE | jq -r '.uploadUrl')

# Step 2: Upload file
curl -X PUT "$UPLOAD_URL" \
  -H 'Content-Type: video/mp4' \
  --data-binary @test-video.mp4
```

## Performance Metrics

### Before (Direct API Gateway Upload)
- **Max File Size:** 10MB
- **Upload Time (50MB):** Not possible
- **API Gateway Cost:** $3.50/million requests
- **Lambda Cost:** $0.20/million requests
- **Data Transfer:** Through Lambda (expensive)

### After (Presigned URL)
- **Max File Size:** 5TB
- **Upload Time (50MB):** ~10 seconds (depends on network)
- **API Gateway Cost:** $3.50/million requests (only for URL generation)
- **Lambda Cost:** $0.20/million requests (only for URL generation)
- **Data Transfer:** Direct to S3 (free within region)

### Cost Savings

For 10,000 claims with 50MB videos each:

**Before:** Not possible (API Gateway limit)

**After:**
- Presigned URL generation: 10,000 requests × $0.0000035 = $0.035
- S3 PUT requests: 10,000 × $0.005/1000 = $0.05
- S3 storage (500GB): $0.023/GB × 500 = $11.50
- **Total:** $11.585 for 10,000 claims

## Error Handling

### Common Errors

1. **Invalid Content Type**
   ```json
   {
     "error": "Invalid content type",
     "message": "Only video and image files are allowed"
   }
   ```

2. **Missing Fields**
   ```json
   {
     "error": "Missing required fields",
     "message": "claimId, filename, and contentType are required"
   }
   ```

3. **Upload Timeout**
   - Presigned URL expires after 5 minutes
   - Frontend should request new URL if upload fails

4. **S3 Upload Failure**
   - Check network connectivity
   - Verify Content-Type header matches
   - Ensure file size is reasonable (<500MB recommended)

## Security Considerations

1. **Add Cognito Authentication:** Require authenticated users to request presigned URLs
2. **Rate Limiting:** Prevent abuse with API Gateway throttling
3. **File Size Validation:** Add max file size check (e.g., 500MB)
4. **Virus Scanning:** Integrate with S3 antivirus scanning
5. **Audit Logging:** Log all presigned URL requests to CloudWatch

## Production Checklist

- [ ] Deploy Lambda function
- [ ] Add API Gateway endpoint
- [ ] Update frontend to use presigned URLs
- [ ] Add Cognito authentication
- [ ] Configure S3 CORS for direct uploads
- [ ] Set up CloudWatch alarms for failures
- [ ] Test with large video files (100MB+)
- [ ] Document for farmers (if needed)
- [ ] Add monitoring dashboard

## Conclusion

Presigned URLs solve the API Gateway 10MB limit elegantly by:
1. Bypassing API Gateway for large uploads
2. Providing secure, time-limited access
3. Reducing costs (no data transfer through Lambda)
4. Improving performance (direct S3 upload)
5. Simplifying architecture (single PUT request)

This is the **recommended approach** for all large file uploads in serverless architectures.
