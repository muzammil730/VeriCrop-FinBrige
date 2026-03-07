/**
 * Retry Utilities with Exponential Backoff
 * 
 * PURPOSE: Implement retry logic for transient failures
 * 
 * FEATURES:
 * - Exponential backoff with jitter
 * - Configurable max retries and delays
 * - Idempotency key support
 * - Retry on specific error types
 * 
 * Requirements: 17.2
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors?: string[];
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableErrors: [
    'ServiceUnavailable',
    'ThrottlingException',
    'TooManyRequestsException',
    'RequestTimeout',
    'NetworkError',
  ],
};

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * (Math.random() - 0.5);
  
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error, config: RetryConfig): boolean {
  if (!config.retryableErrors || config.retryableErrors.length === 0) {
    return true; // Retry all errors if no specific errors configured
  }

  const errorName = error.name || error.constructor.name;
  const errorMessage = error.message || '';

  return config.retryableErrors.some(
    (retryableError) =>
      errorName.includes(retryableError) || errorMessage.includes(retryableError)
  );
}

/**
 * Execute function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      
      return {
        success: true,
        result,
        attempts: attempt + 1,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt < config.maxRetries && isRetryableError(lastError, config)) {
        const delay = calculateDelay(attempt, config);
        
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`, {
          error: lastError.message,
          nextDelay: delay,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Max retries reached or non-retryable error
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: config.maxRetries + 1,
    totalDuration: Date.now() - startTime,
  };
}

/**
 * Idempotency key generator
 */
export function generateIdempotencyKey(
  operation: string,
  ...params: any[]
): string {
  const data = JSON.stringify({ operation, params, timestamp: Date.now() });
  
  // Simple hash function for idempotency key
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${operation}-${Math.abs(hash).toString(36)}`;
}

/**
 * Idempotency cache for preventing duplicate operations
 */
const idempotencyCache = new Map<string, { result: any; timestamp: number }>();
const IDEMPOTENCY_TTL_MS = 3600000; // 1 hour

/**
 * Execute function with idempotency protection
 */
export async function executeWithIdempotency<T>(
  idempotencyKey: string,
  fn: () => Promise<T>
): Promise<T> {
  // Check if operation was already executed
  const cached = idempotencyCache.get(idempotencyKey);
  
  if (cached) {
    const age = Date.now() - cached.timestamp;
    
    if (age < IDEMPOTENCY_TTL_MS) {
      console.log(`Idempotent operation detected, returning cached result`, {
        idempotencyKey,
        age: `${(age / 1000).toFixed(1)}s`,
      });
      
      return cached.result;
    } else {
      // Expired, remove from cache
      idempotencyCache.delete(idempotencyKey);
    }
  }

  // Execute operation
  const result = await fn();

  // Cache result
  idempotencyCache.set(idempotencyKey, {
    result,
    timestamp: Date.now(),
  });

  // Clean up expired entries periodically
  if (idempotencyCache.size > 1000) {
    cleanupIdempotencyCache();
  }

  return result;
}

/**
 * Clean up expired idempotency cache entries
 */
function cleanupIdempotencyCache(): void {
  const now = Date.now();
  let removed = 0;

  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
      removed++;
    }
  }

  console.log(`Cleaned up ${removed} expired idempotency cache entries`);
}

/**
 * Pre-configured retry configurations
 */
export const RETRY_CONFIGS = {
  // For blockchain transactions (QLDB, Hyperledger)
  blockchain: {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
    retryableErrors: ['ServiceUnavailable', 'ThrottlingException', 'ConflictException'],
  },

  // For payment processing
  payment: {
    maxRetries: 3,
    initialDelayMs: 2000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableErrors: ['ServiceUnavailable', 'RequestTimeout', 'GatewayTimeout'],
  },

  // For external API calls (weather, etc.)
  externalAPI: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 8000,
    backoffMultiplier: 2,
    jitterFactor: 0.15,
    retryableErrors: ['ServiceUnavailable', 'RequestTimeout', 'TooManyRequestsException'],
  },

  // For DynamoDB operations
  dynamodb: {
    maxRetries: 4,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableErrors: ['ProvisionedThroughputExceededException', 'ThrottlingException'],
  },
};
