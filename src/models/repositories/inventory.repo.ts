import { Types } from 'mongoose';

import inventoryModel from '../inventory.model';
type InsertInventoryProps = {
  productId: Types.ObjectId;
  quantity: number;
  shopId: string;
};
const insertInventory = async (inventory: InsertInventoryProps) => {
  const { productId, quantity, shopId } = inventory;
  return await inventoryModel.create({
    invenProductId: productId,
    invenStock: quantity,
    invenShopId: shopId,
  });
};

export { insertInventory };

