// Database Configuration
export const config = {
  // Pentru local development cu PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nutriplan',
    user: process.env.DB_USER || process.env.USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    // Connection string - priority: POSTGRES_URL (Neon) > DATABASE_URL > POSTGRES_PRISMA_URL
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || null
  },
  
  // JWT Secret
  jwtSecret: process.env.JWT_SECRET || 'nutri-plan-plus-super-secret-key-2024',
  
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

