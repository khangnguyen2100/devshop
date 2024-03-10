import { createClient } from 'redis';

import configEnv from './config.env';
const redisUri: string = configEnv.redisUri;

const redisClient = createClient({
  url: redisUri,
});

export default redisClient;
