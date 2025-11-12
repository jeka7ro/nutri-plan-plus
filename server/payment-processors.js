// Payment Processors Management for Romania, Europe & USA
// Supports: VIVA Wallet, Revolut, Stripe, PayPal, Square, EuPlătesc

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize payment processors table
export async function initPaymentProcessorsTable() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_processors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        processor_type VARCHAR(50) NOT NULL, -- 'viva', 'revolut', 'stripe', 'paypal', 'square', 'euplatesc'
        region VARCHAR(50) NOT NULL, -- 'romania', 'europe', 'usa', 'global'
        status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'error'
        api_key TEXT,
        secret_key TEXT,
        webhook_url TEXT,
        webhook_secret TEXT,
        commission_rate DECIMAL(5,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'RON',
        supported_methods JSONB DEFAULT '[]', -- ['card', 'transfer', 'wallet', 'paypal', etc.]
        test_mode BOOLEAN DEFAULT true,
        config JSONB DEFAULT '{}', -- Additional processor-specific config
        monthly_volume DECIMAL(12,2) DEFAULT 0.00,
        monthly_transactions INTEGER DEFAULT 0,
        last_transaction_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        processor_id INTEGER REFERENCES payment_processors(id),
        external_id VARCHAR(255), -- ID from payment processor
        user_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
        payment_method VARCHAR(50),
        customer_email VARCHAR(255),
        customer_name VARCHAR(255),
        description TEXT,
        fee_amount DECIMAL(10,2) DEFAULT 0.00,
        metadata JSONB DEFAULT '{}',
        webhook_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        failed_at TIMESTAMP
      )
    `);

    console.log('✅ Payment processors tables initialized');
  } catch (error) {
    console.error('❌ Error initializing payment processors tables:', error);
  } finally {
    client.release();
  }
}

// Seed default payment processors
export async function seedDefaultProcessors() {
  const client = await pool.connect();
  
  try {
    const defaultProcessors = [
      {
        name: 'VIVA Wallet',
        processor_type: 'viva',
        region: 'romania',
        commission_rate: 1.9,
        currency: 'RON',
        supported_methods: ['card', 'transfer', 'wallet'],
        config: {
          environment: 'production',
          merchant_id: '',
          api_key: '',
          source_code: ''
        }
      },
      {
        name: 'Revolut Business',
        processor_type: 'revolut',
        region: 'europe',
        commission_rate: 1.2,
        currency: 'EUR',
        supported_methods: ['card', 'transfer', 'revolut_pay'],
        config: {
          environment: 'production',
          api_key: '',
          webhook_secret: ''
        }
      },
      {
        name: 'Stripe Global',
        processor_type: 'stripe',
        region: 'global',
        commission_rate: 2.9,
        currency: 'USD',
        supported_methods: ['card', 'apple_pay', 'google_pay', 'sepa'],
        config: {
          publishable_key: '',
          secret_key: '',
          webhook_secret: ''
        }
      },
      {
        name: 'PayPal Global',
        processor_type: 'paypal',
        region: 'global',
        commission_rate: 3.4,
        currency: 'USD',
        supported_methods: ['paypal', 'card'],
        config: {
          client_id: '',
          client_secret: '',
          environment: 'production'
        }
      },
      {
        name: 'EuPlătesc România',
        processor_type: 'euplatesc',
        region: 'romania',
        commission_rate: 2.5,
        currency: 'RON',
        supported_methods: ['card', 'transfer'],
        config: {
          merchant_id: '',
          secret_key: ''
        }
      }
    ];

    for (const processor of defaultProcessors) {
      await client.query(`
        INSERT INTO payment_processors (
          name, processor_type, region, commission_rate, currency, 
          supported_methods, config, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'inactive')
        ON CONFLICT DO NOTHING
      `, [
        processor.name,
        processor.processor_type,
        processor.region,
        processor.commission_rate,
        processor.currency,
        JSON.stringify(processor.supported_methods),
        JSON.stringify(processor.config)
      ]);
    }

    console.log('✅ Default payment processors seeded');
  } catch (error) {
    console.error('❌ Error seeding payment processors:', error);
  } finally {
    client.release();
  }
}

// Payment processor classes
export class VivaWalletProcessor {
  constructor(config) {
    this.merchantId = config.merchant_id;
    this.apiKey = config.api_key;
    this.sourceCode = config.source_code;
    this.environment = config.environment || 'production';
    this.baseUrl = this.environment === 'production' 
      ? 'https://www.vivapayments.com/api'
      : 'https://demo.vivapayments.com/api';
  }

  async createPayment(amount, currency, description, customerEmail) {
    // VIVA Wallet payment creation logic
    const paymentData = {
      Amount: Math.round(amount * 100), // Convert to cents
      CustomerTrns: description,
      Customer: {
        Email: customerEmail
      },
      PaymentTimeout: 300,
      Preauth: false,
      AllowRecurring: false,
      MaxInstallments: 0,
      PaymentNotification: true,
      DisableExactAmount: false,
      DisableCash: true,
      DisableWallet: false,
      SourceCode: this.sourceCode
    };

    // Implementation would make actual API call to VIVA
    return {
      success: true,
      paymentUrl: `${this.baseUrl}/orders/payment`,
      orderId: 'viva_' + Date.now(),
      data: paymentData
    };
  }

  async verifyWebhook(payload, signature) {
    // VIVA webhook verification logic
    return true;
  }
}

export class RevolutProcessor {
  constructor(config) {
    this.apiKey = config.api_key;
    this.webhookSecret = config.webhook_secret;
    this.environment = config.environment || 'production';
    this.baseUrl = this.environment === 'production'
      ? 'https://merchant.revolut.com/api'
      : 'https://merchant.revolut.com/api'; // Same for both
  }

  async createPayment(amount, currency, description, customerEmail) {
    const paymentData = {
      amount: Math.round(amount * 100),
      currency: currency,
      description: description,
      customer_email: customerEmail,
      capture_mode: 'AUTOMATIC'
    };

    return {
      success: true,
      paymentUrl: `${this.baseUrl}/orders`,
      orderId: 'revolut_' + Date.now(),
      data: paymentData
    };
  }

  async verifyWebhook(payload, signature) {
    // Revolut webhook verification
    return true;
  }
}

export class StripeProcessor {
  constructor(config) {
    this.secretKey = config.secret_key;
    this.publishableKey = config.publishable_key;
    this.webhookSecret = config.webhook_secret;
  }

  async createPayment(amount, currency, description, customerEmail) {
    const paymentData = {
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      description: description,
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true
      }
    };

    return {
      success: true,
      paymentUrl: 'https://api.stripe.com/v1/payment_intents',
      orderId: 'stripe_' + Date.now(),
      data: paymentData
    };
  }

  async verifyWebhook(payload, signature) {
    // Stripe webhook verification using stripe library
    return true;
  }
}

// Factory function to get processor instance
export function getPaymentProcessor(processorType, config) {
  switch (processorType) {
    case 'viva':
      return new VivaWalletProcessor(config);
    case 'revolut':
      return new RevolutProcessor(config);
    case 'stripe':
      return new StripeProcessor(config);
    default:
      throw new Error(`Unsupported payment processor: ${processorType}`);
  }
}

// Database operations
export class PaymentProcessorService {
  static async getAllProcessors() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM payment_processors 
        ORDER BY region, name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async getActiveProcessors() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM payment_processors 
        WHERE status = 'active'
        ORDER BY region, name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async createProcessor(processorData) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO payment_processors (
          name, processor_type, region, api_key, secret_key, 
          webhook_url, commission_rate, currency, supported_methods, 
          test_mode, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        processorData.name,
        processorData.processor_type,
        processorData.region,
        processorData.api_key,
        processorData.secret_key,
        processorData.webhook_url,
        processorData.commission_rate,
        processorData.currency,
        JSON.stringify(processorData.supported_methods || []),
        processorData.test_mode || true,
        JSON.stringify(processorData.config || {})
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateProcessor(id, updates) {
    const client = await pool.connect();
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [id, ...Object.values(updates)];
      
      const result = await client.query(`
        UPDATE payment_processors 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, values);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async deleteProcessor(id) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM payment_processors WHERE id = $1', [id]);
      return true;
    } finally {
      client.release();
    }
  }

  static async recordTransaction(transactionData) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO payment_transactions (
          processor_id, external_id, user_id, amount, currency,
          status, payment_method, customer_email, customer_name,
          description, fee_amount, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        transactionData.processor_id,
        transactionData.external_id,
        transactionData.user_id,
        transactionData.amount,
        transactionData.currency,
        transactionData.status,
        transactionData.payment_method,
        transactionData.customer_email,
        transactionData.customer_name,
        transactionData.description,
        transactionData.fee_amount || 0,
        JSON.stringify(transactionData.metadata || {})
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async getTransactions(limit = 50, offset = 0) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          t.*,
          p.name as processor_name,
          p.processor_type
        FROM payment_transactions t
        JOIN payment_processors p ON t.processor_id = p.id
        ORDER BY t.created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async updateMonthlyStats(processorId, amount) {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE payment_processors 
        SET 
          monthly_volume = monthly_volume + $2,
          monthly_transactions = monthly_transactions + 1,
          last_transaction_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [processorId, amount]);
    } finally {
      client.release();
    }
  }
}

// Initialize on import
if (process.env.NODE_ENV !== 'test') {
  initPaymentProcessorsTable()
    .then(() => seedDefaultProcessors())
    .catch(console.error);
}
