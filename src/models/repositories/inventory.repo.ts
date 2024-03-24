import { ClientSession, Types } from 'mongoose';
import { convertToObjectId } from 'src/utils/common';

import inventoryModel from '../inventory.model';
type InsertInventoryProps = {
  productId: Types.ObjectId;
  stock: number;
  shopId: Types.ObjectId;
  location?: string | null;
};

const insertInventory = async (inventory: InsertInventoryProps) => {
  const { productId, stock, shopId, location } = inventory;
  return await inventoryModel.create({
    invenProductId: productId,
    invenStock: stock,
    invenShopId: shopId,
    invenLocation: location,
  });
};
const checkIsEnoughQuantity = async (props: {
  productId: string;
  quantity: number;
}): Promise<boolean> => {
  const { productId, quantity } = props;

  const query = {
    invenProductId: convertToObjectId(productId),
    invenStock: {
      $gte: quantity,
    },
  };
  const result = await inventoryModel.findOne(query).lean();
  return Boolean(result?._id);
};
const updateInventory = async (props: {
  productId: string;
  newQuantity: number;
  userId: string;
}) => {
  const { productId, newQuantity, userId } = props;

  const query = {
    invenProductId: convertToObjectId(productId),
    invenShopId: convertToObjectId(userId),
  };
  const updateSet = {
    invenStock: newQuantity,
    invenProductId: convertToObjectId(productId),
    invenShopId: convertToObjectId(userId),
  };

  const result = await inventoryModel.updateOne(query, updateSet);

  return result;
};
// trừ số lượng trong kho kho có người đặt hàng
const reservationInventory = async (props: {
  productId: string;
  cartId: string;
  quantity: number;
  session?: ClientSession;
}) => {
  const { cartId, productId, quantity, session } = props;

  const query = {
    invenProductId: convertToObjectId(productId),
    invenStock: {
      $gte: quantity,
    },
  };
  const foundInventory = await inventoryModel.findOne(query);
  if (!foundInventory) {
    return null;
  }
  foundInventory.invenStock -= quantity;
  foundInventory.invenReservations.push({
    cartId,
    quantity,
    createdAt: new Date(),
  });
  return foundInventory.save({
    session,
  });
};

// back lại số lượng trong kho khi hủy đơn hàng
const cancelReservationInventory = async (props: {
  productId: string;
  cartId: string;
  quantity: number;
  session?: ClientSession;
}) => {
  const { cartId, productId, quantity, session } = props;

  const query = {
    invenProductId: convertToObjectId(productId),
  };
  const foundInventory = await inventoryModel.findOne(query);
  if (!foundInventory) {
    return null;
  }
  foundInventory.invenStock += quantity;
  foundInventory.invenReservations = foundInventory.invenReservations.filter(
    item => item.cartId !== cartId,
  );
  return await foundInventory.save({
    session,
  });
};

export {
  checkIsEnoughQuantity,
  insertInventory,
  reservationInventory,
  updateInventory,
  cancelReservationInventory,
};
