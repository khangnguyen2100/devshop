import { ClientSession } from 'mongoose';
import redisClient from 'src/configs/redis';
import { reservationInventory } from 'src/models/repositories/inventory.repo';
import { delay } from 'src/utils/common';
const acquireLock = async (props: {
  productId: string;
  cartId: string;
  quantity: number;
  session?: ClientSession;
}) => {
  const { cartId, productId, quantity, session } = props;

  const KEY = `lock_v2024_${productId}`;
  const RETRY_TIME = 10;
  const EXPIRE_TIME = 3000; // 3s

  // try to lock this key
  for (let i = 0; i < RETRY_TIME; i++) {
    // lock key
    const result = await redisClient.set(KEY, `cartId::${cartId}`, {
      PX: EXPIRE_TIME,
      NX: true,
    });
    if (result) {
      // bat dau tru hang trong kho
      const isReservation = await reservationInventory({
        cartId,
        productId,
        quantity,
        session,
      });
      // tai sai phai cho 3s moi delete key?
      // await redisClient.pExpire(KEY, EXPIRE_TIME);
      if (isReservation.modifiedCount) {
        await releaseLock(KEY);
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

const releaseLock = async (keyLock: string) => {
  return redisClient.del(keyLock);
};

export { acquireLock, releaseLock };
