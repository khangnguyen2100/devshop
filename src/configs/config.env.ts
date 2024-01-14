import packageJson from '../../package.json';

/**
 * Pattern for config is:
 * key: process.env['KEY'] ?? default
 */
const configEnv = {
  version: packageJson.version,
  name: packageJson.name,
  description: packageJson.description,

  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: process.env['PORT'] ?? 3000,
  mongoUri: process.env['MONGO_URI'] ?? 'mongodb://localhost:27017',

  // jwt
  accessTokenExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '1h',
  refreshTokenExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  cookieExpiresTime:
    Number(process.env['JWT_COOKIE_EXPIRES_TIME']) ?? 7 * 24 * 60 * 60 * 1000, // 7 days

  clientCorsOrigins: {
    test: process.env['DEV_ORIGIN'] ?? '*',
    development: process.env['DEV_ORIGIN'] ?? '*',
    production: process.env['PROD_ORIGIN'] ?? 'none',
  },
};

export default configEnv;
