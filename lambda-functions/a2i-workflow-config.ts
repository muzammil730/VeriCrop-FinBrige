/**
 * Amazon Augmented AI (A2I) Workflow Configuration
 * 
 * This module configures A2I for human-in-the-loop (HITL) claim review.
 * 
 * IMPORTANT: For MVP/Hackathon, we're using a simplified mock implementation.
 * In production, you would:
 * 1. Create an A2I Flow Definition in AWS Console or via CDK
 * 2. Set up a Private Workteam with human reviewers
 * 3. Create a custom UI template for claim review
 * 4. Integrate with Amazon SageMaker Ground Truth
 * 
 * Requirements: 8.1, 8.3
 */

export interface A2IWorkflowConfig {
  flowDefinitionArn: string;
  workteamArn: string;
  taskTitle: string;
  taskDescription: string;
  taskKeywords: string[];
  taskAvailabilityLifetimeInSeconds: number;
  taskTimeLimitInSeconds: number;
  maxConcurrentTaskCount: number;
}

export interface A2ITaskTemplate {
  claimId: string;
  farmerName: string;
  farmLocation: string;
  damageType: string;
  damageAmount: number;
  evidenceUrls: string[];
  validationResults: {
    solarAzimuth?: any;
    shadowComparison?: any;
    weatherCorrelation?: any;
    cropDamageClassification?: any;
    rekognitionAnalysis?: any;
  };
  overallConfidence: number;
  fraudRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flaggedReasons: string[];
}

/**
 * Get A2I workflow configuration
 * 
 * For MVP: Returns mock configuration
 * For Production: Would return actual A2I Flow Definition ARN
 */
export function getA2IWorkflowConfig(): A2IWorkflowConfig {
  // MVP: Mock configuration
  return {
    flowDefinitionArn: 'arn:aws:sagemaker:ap-south-1:889168907575:flow-definition/vericrop-claim-review',
    workteamArn: 'arn:aws:sagemaker:ap-south-1:889168907575:workteam/private-crowd/vericrop-reviewers',
    taskTitle: 'VeriCrop Claim Review',
    taskDescription: 'Review crop damage claim for fraud detection and validation',
    taskKeywords: ['crop', 'damage', 'insurance', 'fraud', 'validation'],
    taskAvailabilityLifetimeInSeconds: 86400, // 24 hours
    taskTimeLimitInSeconds: 3600, // 1 hour per task
    maxConcurrentTaskCount: 10,
  };
}

/**
 * Generate A2I UI template for claim review
 * 
 * This template is shown to human reviewers in the A2I console.
 * It displays all claim evidence and validation results.
 */
export function generateA2IUITemplate(task: A2ITaskTemplate): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VeriCrop Claim Review</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c5f2d;
      border-bottom: 3px solid #2c5f2d;
      padding-bottom: 10px;
    }
    h2 {
      color: #4a7c59;
      margin-top: 30px;
    }
    .claim-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    .info-item {
      padding: 15px;
      background-color: #f9f9f9;
      border-left: 4px solid #2c5f2d;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 16px;
      margin-top: 5px;
    }
    .risk-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .risk-low { background-color: #d4edda; color: #155724; }
    .risk-medium { background-color: #fff3cd; color: #856404; }
    .risk-high { background-color: #f8d7da; color: #721c24; }
    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .evidence-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    .evidence-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .validation-results {
      margin: 20px 0;
    }
    .validation-item {
      padding: 15px;
      margin: 10px 0;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .confidence-bar {
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 10px;
    }
    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b 0%, #ffd93d 50%, #6bcf7f 100%);
      transition: width 0.3s ease;
    }
    .flags {
      margin: 20px 0;
    }
    .flag-item {
      padding: 10px 15px;
      margin: 5px 0;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
    .decision-section {
      margin-top: 40px;
      padding: 30px;
      background-color: #f0f8ff;
      border-radius: 8px;
      border: 2px solid #2c5f2d;
    }
    .radio-group {
      margin: 20px 0;
    }
    .radio-option {
      display: block;
      padding: 15px;
      margin: 10px 0;
      background-color: white;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .radio-option:hover {
      border-color: #2c5f2d;
      background-color: #f9f9f9;
    }
    .radio-option input[type="radio"] {
      margin-right: 10px;
    }
    textarea {
      width: 100%;
      min-height: 100px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌾 VeriCrop Claim Review</h1>
    
    <div class="claim-info">
      <div class="info-item">
        <div class="info-label">Claim ID</div>
        <div class="info-value">${task.claimId}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Farmer Name</div>
        <div class="info-value">${task.farmerName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Farm Location</div>
        <div class="info-value">${task.farmLocation}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Damage Type</div>
        <div class="info-value">${task.damageType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Damage Amount</div>
        <div class="info-value">₹${task.damageAmount.toLocaleString('en-IN')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fraud Risk Level</div>
        <div class="info-value">
          <span class="risk-badge risk-${task.fraudRiskLevel.toLowerCase()}">${task.fraudRiskLevel}</span>
        </div>
      </div>
    </div>

    <h2>📊 Overall Confidence</h2>
    <div class="confidence-bar">
      <div class="confidence-fill" style="width: ${task.overallConfidence}%"></div>
    </div>
    <p style="text-align: center; margin-top: 5px; color: #666;">
      ${task.overallConfidence.toFixed(1)}% Confidence
    </p>

    ${task.flaggedReasons.length > 0 ? `
    <h2>⚠️ Flagged Issues</h2>
    <div class="flags">
      ${task.flaggedReasons.map(reason => `
        <div class="flag-item">${reason}</div>
      `).join('')}
    </div>
    ` : ''}

    <h2>📸 Evidence</h2>
    <div class="evidence-grid">
      ${task.evidenceUrls.map((url, index) => `
        <div class="evidence-item">
          <img src="${url}" alt="Evidence ${index + 1}" />
          <div style="padding: 10px;">
            <strong>Evidence ${index + 1}</strong>
          </div>
        </div>
      `).join('')}
    </div>

    <h2>🔍 Validation Results</h2>
    <div class="validation-results">
      ${task.validationResults.solarAzimuth ? `
        <div class="validation-item">
          <strong>Solar Azimuth Validation</strong>
          <p>Confidence: ${task.validationResults.solarAzimuth.confidence}%</p>
          <p>Result: ${task.validationResults.solarAzimuth.result}</p>
        </div>
      ` : ''}
      
      ${task.validationResults.weatherCorrelation ? `
        <div class="validation-item">
          <strong>Weather Correlation</strong>
          <p>Score: ${task.validationResults.weatherCorrelation.score}%</p>
          <p>Recommendation: ${task.validationResults.weatherCorrelation.recommendation}</p>
        </div>
      ` : ''}
      
      ${task.validationResults.cropDamageClassification ? `
        <div class="validation-item">
          <strong>AI Crop Damage Classification</strong>
          <p>Detected: ${task.validationResults.cropDamageClassification.damageType}</p>
          <p>Confidence: ${task.validationResults.cropDamageClassification.confidence}%</p>
        </div>
      ` : ''}
    </div>

    <div class="decision-section">
      <h2>✅ Your Decision</h2>
      <p>Please review all evidence and validation results, then make your decision:</p>
      
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" name="decision" value="APPROVE" required />
          <strong>APPROVE</strong> - Claim is legitimate, approve for payout
        </label>
        
        <label class="radio-option">
          <input type="radio" name="decision" value="REJECT" required />
          <strong>REJECT</strong> - Claim is fraudulent or invalid
        </label>
        
        <label class="radio-option">
          <input type="radio" name="decision" value="REQUEST_MORE_INFO" required />
          <strong>REQUEST MORE INFO</strong> - Need additional evidence or clarification
        </label>
      </div>

      <h3>Rationale (Required)</h3>
      <p style="color: #666; font-size: 14px;">
        Please explain your decision. This will be used to improve the AI model.
      </p>
      <textarea name="rationale" required placeholder="Enter your reasoning here..."></textarea>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create A2I task input for SageMaker
 * 
 * This is the input format expected by Amazon A2I StartHumanLoop API
 */
export function createA2ITaskInput(task: A2ITaskTemplate): any {
  return {
    HumanLoopName: `claim-review-${task.claimId}-${Date.now()}`,
    FlowDefinitionArn: getA2IWorkflowConfig().flowDefinitionArn,
    HumanLoopInput: {
      InputContent: JSON.stringify(task),
    },
    DataAttributes: {
      ContentClassifiers: ['FreeOfPersonallyIdentifiableInformation'],
    },
  };
}
