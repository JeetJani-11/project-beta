/**
 * Seed script for Supabase database
 * Populates the database with initial sample products
 */

import dotenv from 'dotenv';
import { getSupabaseClient } from '../src/config/supabase';
import { logger } from '../src/config/logger';

// Load environment variables
dotenv.config();

const sampleProducts = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Laptop',
    price: 999.99,
    stock: 50,
    description: 'High performance laptop',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Wireless Mouse',
    price: 29.99,
    stock: 200,
    description: 'Ergonomic wireless mouse',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Mechanical Keyboard',
    price: 149.99,
    stock: 100,
    description: 'RGB mechanical keyboard',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    name: 'USB-C Cable',
    price: 12.99,
    stock: 500,
    description: '3ft USB-C charging cable',
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    name: 'Monitor Stand',
    price: 49.99,
    stock: 75,
    description: 'Adjustable monitor stand',
  },
];

async function seed() {
  try {
    logger.info('Starting database seed...');

    const supabase = getSupabaseClient();

    // Insert sample products
    logger.info('Inserting sample products...');
    const { data, error } = await supabase.from('products').upsert(sampleProducts, {
      onConflict: 'id',
    });

    if (error) {
      throw error;
    }

    logger.info(`Successfully seeded ${sampleProducts.length} products`);
    logger.info('Database seed completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Seed script failed', error);
    process.exit(1);
  }
}

// Run seed
seed();
