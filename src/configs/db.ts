import mongoose from 'mongoose';

import configEnv from './config.env';
import redisClient from './redis';

const mongoUri: string = configEnv.mongoUri;
const nodeEnv: string = configEnv.nodeEnv;

class Database {
  constructor() {
    this.connect();
  }
  static instance: Database;

  connect() {
    if (nodeEnv === 'development') {
      // mongoose.set('debug', true);
      mongoose.set('debug', {
        color: true,
      });
    }
    mongoose
      .connect(mongoUri)
      .then(() => {
        console.log('Connected to DB successfully!');
      })
      .catch((error: any) => {
        console.log('Connected to DB failed!', error);
      });
    redisClient
      .connect()
      .then(() => {
        console.log('Connected to Redis successfully!');
      })
      .catch((error: any) => {
        console.log('Connected to Redis failed!', error);
      });
  }
  close() {
    mongoose.connection.close();
    redisClient.quit();
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceDb = Database.getInstance();

export default instanceDb;
