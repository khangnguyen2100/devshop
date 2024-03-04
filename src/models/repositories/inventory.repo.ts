import { Types } from 'mongoose';
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

const reservationInventory = async (props: {
  productId: string;
  cartId: string;
  quantity: number;
}) => {
  const { cartId, productId, quantity } = props;

  const query = {
    invenProductId: convertToObjectId(productId),
    invenStock: {
      $gte: quantity,
    },
  };
  const updateSet = {
    $inc: {
      invenStock: -quantity,
    },
    $push: {
      invenReservations: {
        cartId,
        quantity,
        createdAt: new Date(),
      },
    },
  };

  const result = await inventoryModel.updateOne(query, updateSet, {
    new: true,
    upsert: true,
  });

  return result;
};

export { insertInventory, reservationInventory };
