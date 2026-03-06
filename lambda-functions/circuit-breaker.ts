/**
 * Circuit Breaker Pattern Implementation
 * 
 * PURPOSE: Prevent cascading failures by failing fast when external services are down
 * 
 * FEATURES:
 * - Automatic circuit opening after failure threshold
 * - Half-open state for testing recovery
 * - Configurable timeout and thresholds
 * - Fallback to cached data
 * 
 * Requirements: 17.1
 */

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing fast
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  successThreshold: number;    // Number of successes to close from half-open
  timeout: number;             // Milliseconds before trying half-open
  name: string;                // Circuit breaker name for logging
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        console.log(`Circuit breaker ${this.config.name} is OPEN, failing fast`);
        
        if (fallback) {
          console.log(`Using fallback for ${this.config.name}`);
          return fallback();
        }
        
        throw new Error(`Circuit breaker ${this.config.name} is OPEN`);
      }
      
      // Timeout expired, try half-open
      this.state = CircuitState.HALF_OPEN;
      console.log(`Circuit breaker ${this.config.name} entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallback && this.state === CircuitState.OPEN) {
        console.log(`Using fallback for ${this.config.name} after failure`);
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log(`Circuit breaker ${this.config.name} CLOSED (recovered)`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
      console.log(`Circuit breaker ${this.config.name} OPENED after ${this.failureCount} failures`);
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker (for testing)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

// ========================================
// Pre-configured Circuit Breakers
// ========================================

/**
 * Circuit breaker for weather API calls
 */
export const weatherAPICircuitBreaker = new CircuitBreaker({
  name: 'WeatherAPI',
  failureThreshold: 3,      // Open after 3 failures
  successThreshold: 2,      // Close after 2 successes
  timeout: 30000,           // Try again after 30 seconds
});

/**
 * Circuit breaker for payment gateway
 */
export const paymentGatewayCircuitBreaker = new CircuitBreaker({
  name: 'PaymentGateway',
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 3,      // Close after 3 successes
  timeout: 60000,           // Try again after 60 seconds
});

/**
 * Circuit breaker for SageMaker inference
 */
export const sagemakerCircuitBreaker = new CircuitBreaker({
  name: 'SageMaker',
  failureThreshold: 3,      // Open after 3 failures
  successThreshold: 2,      // Close after 2 successes
  timeout: 45000,           // Try again after 45 seconds
});

/**
 * Circuit breaker for Bedrock API
 */
export const bedrockCircuitBreaker = new CircuitBreaker({
  name: 'Bedrock',
  failureThreshold: 3,      // Open after 3 failures
  successThreshold: 2,      // Close after 2 successes
  timeout: 30000,           // Try again after 30 seconds
});
