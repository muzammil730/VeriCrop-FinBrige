/**
 * CloudWatch Alarms Setup Script
 * 
 * PURPOSE: Configure CloudWatch monitoring and alarms for VeriCrop FinBridge
 * 
 * ALARMS CONFIGURED:
 * 1. 60-second SLA violations (Step Functions execution time)
 * 2. Fraud detection anomalies (high fraud risk claims)
 * 3. HITL queue backlog (pending human reviews)
 * 4. Lambda function errors
 * 5. Payment gateway failures
 * 6. DynamoDB throttling
 * 
 * Requirements: 1.1, 6.4, 8.3
 */

import {
  CloudWatchClient,
  PutMetricAlarmCommand,
  PutDashboardCommand,
} from '@aws-sdk/client-cloudwatch';
import { SNSClient, CreateTopicCommand, SubscribeCommand } from '@aws-sdk/client-sns';

const cloudwatchClient = new CloudWatchClient({ region: 'ap-south-1' });
const snsClient = new SNSClient({ region: 'ap-south-1' });

// ========================================
// Configuration
// ========================================

const ALARM_CONFIG = {
  slaThresholdSeconds: 60,
  fraudRiskThreshold: 10, // Number of HIGH fraud risk claims per 5 minutes
  hitlBacklogThreshold: 50, // Number of pending HITL reviews
  lambdaErrorThreshold: 5, // Number of errors per 5 minutes
  paymentFailureThreshold: 10, // Number of payment failures per 5 minutes
  dynamodbThrottleThreshold: 5, // Number of throttled requests per 5 minutes
};

const LAMBDA_FUNCTIONS = [
  'vericrop-solar-azimuth-validator',
  'vericrop-shadow-comparator',
  'vericrop-weather-data-integrator',
  'vericrop-weather-correlation-analyzer',
  'vericrop-crop-damage-classifier',
  'vericrop-submission-validator',
  'vericrop-result-consolidator',
  'vericrop-hitl-router',
  'vericrop-claim-rejector',
  'vericrop-certificate-issuer',
  'vericrop-bridge-loan-calculator',
  'vericrop-payment-gateway-handler',
  'vericrop-insurance-payout-processor',
  'vericrop-bedrock-claim-analyzer',
];

// ========================================
// SNS Topic Creation
// ========================================

async function createSNSTopic(): Promise<string> {
  console.log('Creating SNS topic for alarm notifications...');

  const createTopicCommand = new CreateTopicCommand({
    Name: 'VeriCrop-Critical-Alarms',
    Tags: [
      { Key: 'Project', Value: 'VeriCrop-FinBridge' },
      { Key: 'Component', Value: 'Monitoring' },
    ],
  });

  const response = await snsClient.send(createTopicCommand);
  const topicArn = response.TopicArn!;

  console.log('✅ SNS topic created:', topicArn);

  // Subscribe email (optional - user can add via AWS Console)
  console.log('\n📧 To receive alarm notifications, subscribe to the SNS topic:');
  console.log(`   aws sns subscribe --topic-arn ${topicArn} --protocol email --notification-endpoint your-email@example.com --region ap-south-1`);

  return topicArn;
}

// ========================================
// CloudWatch Alarms
// ========================================

async function createSLAViolationAlarm(topicArn: string): Promise<void> {
  console.log('\nCreating SLA violation alarm (60-second threshold)...');

  const alarm = new PutMetricAlarmCommand({
    AlarmName: 'VeriCrop-SLA-Violation-60s',
    AlarmDescription: 'Alert when claim processing exceeds 60 seconds (SLA violation)',
    ActionsEnabled: true,
    AlarmActions: [topicArn],
    MetricName: 'ExecutionTime',
    Namespace: 'AWS/States',
    Statistic: 'Average',
    Dimensions: [
      {
        Name: 'StateMachineArn',
        Value: 'arn:aws:states:ap-south-1:889168907575:stateMachine:VeriCrop-Truth-Engine',
      },
    ],
    Period: 300, // 5 minutes
    EvaluationPeriods: 1,
    Threshold: 60000, // 60 seconds in milliseconds
    ComparisonOperator: 'GreaterThanThreshold',
    TreatMissingData: 'notBreaching',
  });

  await cloudwatchClient.send(alarm);
  console.log('✅ SLA violation alarm created');
}

async function createFraudDetectionAlarm(topicArn: string): Promise<void> {
  console.log('\nCreating fraud detection anomaly alarm...');

  const alarm = new PutMetricAlarmCommand({
    AlarmName: 'VeriCrop-High-Fraud-Risk-Anomaly',
    AlarmDescription: 'Alert when HIGH fraud risk claims exceed threshold',
    ActionsEnabled: true,
    AlarmActions: [topicArn],
    MetricName: 'HighFraudRiskClaims',
    Namespace: 'VeriCrop/FinBridge',
    Statistic: 'Sum',
    Period: 300, // 5 minutes
    EvaluationPeriods: 1,
    Threshold: ALARM_CONFIG.fraudRiskThreshold,
    ComparisonOperator: 'GreaterThanThreshold',
    TreatMissingData: 'notBreaching',
  });

  await cloudwatchClient.send(alarm);
  console.log('✅ Fraud detection alarm created');
}

async function createHITLBacklogAlarm(topicArn: string): Promise<void> {
  console.log('\nCreating HITL queue backlog alarm...');

  const alarm = new PutMetricAlarmCommand({
    AlarmName: 'VeriCrop-HITL-Queue-Backlog',
    AlarmDescription: 'Alert when HITL queue has too many pending reviews',
    ActionsEnabled: true,
    AlarmActions: [topicArn],
    MetricName: 'PendingHITLReviews',
    Namespace: 'VeriCrop/FinBridge',
    Statistic: 'Average',
    Period: 300, // 5 minutes
    EvaluationPeriods: 2,
    Threshold: ALARM_CONFIG.hitlBacklogThreshold,
    ComparisonOperator: 'GreaterThanThreshold',
    TreatMissingData: 'notBreaching',
  });

  await cloudwatchClient.send(alarm);
  console.log('✅ HITL backlog alarm created');
}

async function createLambdaErrorAlarms(topicArn: string): Promise<void> {
  console.log('\nCreating Lambda function error alarms...');

  for (const functionName of LAMBDA_FUNCTIONS) {
    const alarm = new PutMetricAlarmCommand({
      AlarmName: `VeriCrop-Lambda-Errors-${functionName}`,
      AlarmDescription: `Alert when ${functionName} has errors`,
      ActionsEnabled: true,
      AlarmActions: [topicArn],
      MetricName: 'Errors',
      Namespace: 'AWS/Lambda',
      Statistic: 'Sum',
      Dimensions: [
        {
          Name: 'FunctionName',
          Value: functionName,
        },
      ],
      Period: 300, // 5 minutes
      EvaluationPeriods: 1,
      Threshold: ALARM_CONFIG.lambdaErrorThreshold,
      ComparisonOperator: 'GreaterThanThreshold',
      TreatMissingData: 'notBreaching',
    });

    await cloudwatchClient.send(alarm);
  }

  console.log(`✅ Lambda error alarms created for ${LAMBDA_FUNCTIONS.length} functions`);
}

async function createPaymentFailureAlarm(topicArn: string): Promise<void> {
  console.log('\nCreating payment gateway failure alarm...');

  const alarm = new PutMetricAlarmCommand({
    AlarmName: 'VeriCrop-Payment-Gateway-Failures',
    AlarmDescription: 'Alert when payment gateway has too many failures',
    ActionsEnabled: true,
    AlarmActions: [topicArn],
    MetricName: 'PaymentFailures',
    Namespace: 'VeriCrop/FinBridge',
    Statistic: 'Sum',
    Period: 300, // 5 minutes
    EvaluationPeriods: 1,
    Threshold: ALARM_CONFIG.paymentFailureThreshold,
    ComparisonOperator: 'GreaterThanThreshold',
    TreatMissingData: 'notBreaching',
  });

  await cloudwatchClient.send(alarm);
  console.log('✅ Payment failure alarm created');
}

async function createDynamoDBThrottleAlarms(topicArn: string): Promise<void> {
  console.log('\nCreating DynamoDB throttling alarms...');

  const tables = ['VeriCrop-Claims', 'VeriCrop-Certificates', 'VeriCrop-Loans', 'VeriCrop-Weather'];

  for (const tableName of tables) {
    const alarm = new PutMetricAlarmCommand({
      AlarmName: `VeriCrop-DynamoDB-Throttle-${tableName}`,
      AlarmDescription: `Alert when ${tableName} has throttled requests`,
      ActionsEnabled: true,
      AlarmActions: [topicArn],
      MetricName: 'UserErrors',
      Namespace: 'AWS/DynamoDB',
      Statistic: 'Sum',
      Dimensions: [
        {
          Name: 'TableName',
          Value: tableName,
        },
      ],
      Period: 300, // 5 minutes
      EvaluationPeriods: 1,
      Threshold: ALARM_CONFIG.dynamodbThrottleThreshold,
      ComparisonOperator: 'GreaterThanThreshold',
      TreatMissingData: 'notBreaching',
    });

    await cloudwatchClient.send(alarm);
  }

  console.log(`✅ DynamoDB throttle alarms created for ${tables.length} tables`);
}

// ========================================
// CloudWatch Dashboard
// ========================================

async function createCloudWatchDashboard(): Promise<void> {
  console.log('\nCreating CloudWatch dashboard...');

  const dashboardBody = {
    widgets: [
      {
        type: 'metric',
        properties: {
          metrics: [
            ['AWS/States', 'ExecutionTime', { stat: 'Average', label: 'Avg Execution Time' }],
            ['...', { stat: 'Maximum', label: 'Max Execution Time' }],
          ],
          period: 300,
          stat: 'Average',
          region: 'ap-south-1',
          title: 'Claim Processing Time (SLA: 60s)',
          yAxis: {
            left: {
              min: 0,
              max: 70000,
            },
          },
        },
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['VeriCrop/FinBridge', 'HighFraudRiskClaims', { stat: 'Sum', label: 'High Fraud Risk' }],
            ['.', 'MediumFraudRiskClaims', { stat: 'Sum', label: 'Medium Fraud Risk' }],
            ['.', 'LowFraudRiskClaims', { stat: 'Sum', label: 'Low Fraud Risk' }],
          ],
          period: 300,
          stat: 'Sum',
          region: 'ap-south-1',
          title: 'Fraud Risk Distribution',
        },
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['VeriCrop/FinBridge', 'PendingHITLReviews', { stat: 'Average', label: 'Pending Reviews' }],
            ['.', 'CompletedHITLReviews', { stat: 'Sum', label: 'Completed Reviews' }],
          ],
          period: 300,
          stat: 'Average',
          region: 'ap-south-1',
          title: 'HITL Queue Status',
        },
      },
      {
        type: 'metric',
        properties: {
          metrics: LAMBDA_FUNCTIONS.map((fn) => ['AWS/Lambda', 'Errors', { stat: 'Sum' }, { FunctionName: fn }]),
          period: 300,
          stat: 'Sum',
          region: 'ap-south-1',
          title: 'Lambda Function Errors',
        },
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['VeriCrop/FinBridge', 'PaymentSuccesses', { stat: 'Sum', label: 'Successful Payments' }],
            ['.', 'PaymentFailures', { stat: 'Sum', label: 'Failed Payments' }],
          ],
          period: 300,
          stat: 'Sum',
          region: 'ap-south-1',
          title: 'Payment Gateway Status',
        },
      },
      {
        type: 'metric',
        properties: {
          metrics: [
            ['AWS/DynamoDB', 'UserErrors', { stat: 'Sum' }, { TableName: 'VeriCrop-Claims' }],
            ['...', { TableName: 'VeriCrop-Certificates' }],
            ['...', { TableName: 'VeriCrop-Loans' }],
            ['...', { TableName: 'VeriCrop-Weather' }],
          ],
          period: 300,
          stat: 'Sum',
          region: 'ap-south-1',
          title: 'DynamoDB Throttling',
        },
      },
    ],
  };

  const command = new PutDashboardCommand({
    DashboardName: 'VeriCrop-FinBridge-Monitoring',
    DashboardBody: JSON.stringify(dashboardBody),
  });

  await cloudwatchClient.send(command);
  console.log('✅ CloudWatch dashboard created');
  console.log('   View at: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=VeriCrop-FinBridge-Monitoring');
}

// ========================================
// Main Setup Function
// ========================================

async function setupMonitoring(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  VeriCrop FinBridge - CloudWatch Monitoring Setup         ║');
  console.log('║  Task 16.3: Configure CloudWatch Monitoring and Alarms    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Create SNS topic for alarm notifications
    const topicArn = await createSNSTopic();

    // Step 2: Create CloudWatch alarms
    await createSLAViolationAlarm(topicArn);
    await createFraudDetectionAlarm(topicArn);
    await createHITLBacklogAlarm(topicArn);
    await createLambdaErrorAlarms(topicArn);
    await createPaymentFailureAlarm(topicArn);
    await createDynamoDBThrottleAlarms(topicArn);

    // Step 3: Create CloudWatch dashboard
    await createCloudWatchDashboard();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  SETUP COMPLETE                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n✅ CloudWatch monitoring and alarms configured successfully!');
    console.log('\n📊 Dashboard: https://ap-south-1.console.aws.amazon.com/cloudwatch/home?region=ap-south-1#dashboards:name=VeriCrop-FinBridge-Monitoring');
    console.log(`\n📧 Subscribe to alarms: aws sns subscribe --topic-arn ${topicArn} --protocol email --notification-endpoint your-email@example.com --region ap-south-1`);
    console.log('\n🎉 Task 16.3 Complete!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    throw error;
  }
}

// Run setup
setupMonitoring().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
