/**
 * Supabase client configuration
 * Initializes the Supabase client with service role key for backend operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize and return Supabase client singleton
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  logger.info('Supabase client initialized', {
    url: supabaseUrl,
  });

  return supabaseClient;
};

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
};

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('products').select('count').limit(1);

    if (error) {
      logger.error('Supabase connection test failed', error);
      return false;
    }

    logger.info('Supabase connection test successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test error', error);
    return false;
  }
};
