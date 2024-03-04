import { promisify } from 'util';

import * as redis from 'redis';
import { reservationInventory } from 'src/models/repositories/inventory.repo';
import { delay } from 'src/utils/common';

const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
});

const pExpireAsync = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const acquireLock = async (props: {
  productId: string;
  cartId: string;
  quantity: number;
}) => {
  const { cartId, productId, quantity } = props;

  const KEY = `lock_v2024_${productId}`;
  const RETRY_TIME = 10;
  const EXPIRE_TIME = 3000; // 3s

  // try to lock this key
  for (let i = 0; i < RETRY_TIME; i++) {
    // lock key
    const result = await setnxAsync(KEY);
    if (result) {
      // bat dau tru hang trong kho
      const isReservation = await reservationInventory({
        cartId,
        productId,
        quantity,
      });
      if (isReservation.modifiedCount) {
        // tai sai phai cho 3s moi delete key?
        await pExpireAsync(KEY, EXPIRE_TIME);
        return KEY;
      } else {
        return null;
      }
    } else {
      // re-try when this key is locked
      await delay(50);
      return null;
    }
  }
  return null;
};

const releaseLock = async (keyLock: string | number) => {
  return delAsync(keyLock);
};

export { acquireLock, releaseLock };
