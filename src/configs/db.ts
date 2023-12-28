import mongoose from 'mongoose';

import configEnv from './config.env';

const mongoUri: string = configEnv.mongoUri;
const nodeEnv: string = configEnv.nodeEnv;

class Database {
  constructor() {
    this.connect();
  }
  static instance: Database;

  connect() {
    if (nodeEnv === 'development') {
      mongoose.set('debug', true);
      mongoose.set('debug', {
        color: true,
      });
    }
    mongoose
      .connect(mongoUri)
      .then(() => {
        console.log('Connected to DB successfully!');
      })
      .catch(() => {
        console.log('Connected to DB failed!');
      });
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongo = Database.getInstance();

export default instanceMongo;
