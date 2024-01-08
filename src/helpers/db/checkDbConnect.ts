import os from 'os';

import mongoose from 'mongoose';

const OVER_INTERVAL = 5000;
const CONNECTION_PER_CORE = 5;

export const countConnectDb = () => {
  const numConnect = mongoose.connections.length;
  console.log('Number of connections: ', numConnect);
  return numConnect;
};

export const checkOverload = () => {
  setInterval(() => {
    // get connections and cores info
    const numConnect = mongoose.connections.length;
    const numCores = os.cpus().length;
    const maxConnections = numCores * CONNECTION_PER_CORE;

    // get memory usage in MB
    const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

    console.info('Active connection:', numConnect);
    console.info('Memory usage: %d MB', memoryUsage);

    // check overload
    if (numConnect > maxConnections) {
      console.warn('Connection overloaded!!!');
    }
  }, OVER_INTERVAL);
};
