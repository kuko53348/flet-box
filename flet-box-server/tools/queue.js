// queue.js - Job queue module for FletBox
import Bull from 'bull';

/**
 * # QUEUE MODULE
 * - Job queue with Redis
 * - Process jobs in background
 * - Retry on failure
 *
 * @example
 * import { queue, createQueue } from '@flet-box/queue';
 *
 * // Create a queue
 * const emailQueue = createQueue('email', {
 *   redis: { host: 'localhost', port: 6379 }
 * });
 *
 * // Add a job
 * emailQueue.add({ to: 'user@email.com', subject: 'Welcome' });
 *
 * // Process jobs
 * emailQueue.process(async (job) => {
 *   await sendEmail(job.data);
 * });
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Store queues
const queues = new Map();

/**
 * Create a new queue
 * @param {string} name - Queue name
 * @param {Object} options - Bull options
 * @param {Object} options.redis - Redis connection options
 * @param {number} options.attempts - Max attempts (default: 3)
 * @param {number} options.backoff - Backoff delay in ms (default: 5000)
 * @returns {Bull.Queue} Bull queue instance
 */
export function createQueue(name, options = {}) {
  if (queues.has(name)) {
    return queues.get(name);
  }

  const {
    redis = REDIS_URL,
    attempts = 3,
    backoff = 5000,
    ...rest
  } = options;

  const queue = new Bull(name, { redis, ...rest });

  // Default processor (can be overridden)
  queue.process(async (job) => {
    console.log(`📦 Job ${job.id} started (${job.name})`);
    // The user must define their own processor
  });

  // Log events
  queue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed (${job.name})`);
  });

  queue.on('failed', (job, error) => {
    console.error(`❌ Job ${job.id} failed:`, error.message);
  });

  queue.on('stalled', (job) => {
    console.warn(`⚠️ Job ${job.id} stalled`);
  });

  queues.set(name, queue);
  return queue;
}

/**
 * Get an existing queue
 * @param {string} name - Queue name
 * @returns {Bull.Queue} Bull queue instance
 */
export function getQueue(name) {
  if (!queues.has(name)) {
    throw new Error(`Queue "${name}" does not exist`);
  }
  return queues.get(name);
}

/**
 * Add a job to a queue
 * @param {string} name - Queue name
 * @param {Object} data - Job data
 * @param {Object} options - Job options
 * @param {number} options.delay - Delay in ms
 * @param {number} options.attempts - Max attempts
 * @param {number} options.backoff - Backoff delay in ms
 * @param {string} options.jobId - Custom job ID
 * @returns {Promise<Bull.Job>} Job instance
 */
export async function addJob(name, data, options = {}) {
  const queue = getQueue(name);
  return queue.add(data, options);
}

/**
 * Process a queue
 * @param {string} name - Queue name
 * @param {Function} processor - Job processor function
 * @param {Object} options - Processing options
 * @param {number} options.concurrency - Number of concurrent jobs (default: 1)
 * @returns {void}
 */
export function processQueue(name, processor, options = {}) {
  const queue = getQueue(name);
  const { concurrency = 1 } = options;
  queue.process(concurrency, processor);
}

/**
 * Get queue status
 * @param {string} name - Queue name
 * @returns {Promise<Object>} Queue status
 */
export async function getQueueStatus(name) {
  const queue = getQueue(name);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Clean a queue
 * @param {string} name - Queue name
 * @param {number} grace - Grace period in ms (default: 60000)
 * @param {string} limit - Clean limit (default: 1000)
 * @returns {Promise<void>}
 */
export async function cleanQueue(name, grace = 60000, limit = 1000) {
  const queue = getQueue(name);
  await queue.clean(grace, limit);
}

/**
 * Close a queue
 * @param {string} name - Queue name
 * @returns {Promise<void>}
 */
export async function closeQueue(name) {
  const queue = queues.get(name);
  if (queue) {
    await queue.close();
    queues.delete(name);
  }
}

/**
 * Close all queues
 * @returns {Promise<void>}
 */
export async function closeAllQueues() {
  for (const [name, queue] of queues) {
    await queue.close();
    queues.delete(name);
  }
}

// Helper: Retryable job
export function retryable(fn, maxAttempts = 3, delayMs = 1000) {
  return async (...args) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${maxAttempts} failed:`, error.message);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    throw lastError;
  };
}

export default {
  createQueue,
  getQueue,
  addJob,
  processQueue,
  getQueueStatus,
  cleanQueue,
  closeQueue,
  closeAllQueues,
  retryable,
};
