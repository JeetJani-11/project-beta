/**
 * Storage Factory
 * Provides a unified interface to toggle between InMemoryRepository and SupabaseRepository
 * based on environment configuration
 */

import { InMemoryRepository } from './repositories/InMemoryRepository';
import { SupabaseRepository } from './repositories/SupabaseRepository';
import { isSupabaseConfigured } from '../config/supabase';
import { logger } from '../config/logger';

export type Repository = InMemoryRepository | SupabaseRepository;

let repositoryInstance: Repository | null = null;

/**
 * Get repository instance based on environment configuration
 * If USE_SUPABASE=true and Supabase is configured, returns SupabaseRepository
 * Otherwise, returns InMemoryRepository
 */
export const getRepository = (): Repository => {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  const useSupabase = process.env.USE_SUPABASE === 'true';

  if (useSupabase && isSupabaseConfigured()) {
    logger.info('Using SupabaseRepository for data storage');
    repositoryInstance = SupabaseRepository.getInstance();
  } else {
    if (useSupabase && !isSupabaseConfigured()) {
      logger.warn(
        'USE_SUPABASE=true but Supabase is not configured. Falling back to InMemoryRepository.'
      );
    } else {
      logger.info('Using InMemoryRepository for data storage');
    }
    repositoryInstance = InMemoryRepository.getInstance();
  }

  return repositoryInstance;
};

/**
 * Reset repository instance (useful for testing)
 */
export const resetRepository = (): void => {
  repositoryInstance = null;
  logger.info('Repository instance reset');
};

/**
 * Check if currently using Supabase
 */
export const isUsingSupabase = (): boolean => {
  return repositoryInstance instanceof SupabaseRepository;
};

/**
 * Check if currently using InMemory storage
 */
export const isUsingInMemory = (): boolean => {
  return repositoryInstance instanceof InMemoryRepository;
};
