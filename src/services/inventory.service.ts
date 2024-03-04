import { BadRequestError } from 'src/helpers/core/error.response';
import inventoryModel from 'src/models/inventory.model';
import { findProductById } from 'src/models/repositories/product.repo';
import { convertToObjectId } from 'src/utils/common';

type AddStockProps = {
  stock: number;
  productId: string;
  shopId: string;
  location: string | null;
};
class InventoryService {
  // nhập hàng
  static async addStockToInventory(props: AddStockProps) {
    const { location, productId, shopId, stock } = props;
    // check product is exits
    const productInfo = await findProductById({
      productId,
      shopId,
    });
    if (!productInfo) {
      throw new BadRequestError('Product is not exits');
    }

    // add stock to inventory
    const query = {
      invenShopId: convertToObjectId(shopId),
      invenProductId: convertToObjectId(productId),
    };
    const updateSet = {
      $inc: {
        invenStock: stock,
      },
      $set: {
        invenLocation: location,
      },
    };
    const options = {
      new: true,
      upsert: true,
    };
    const result = await inventoryModel.updateOne(query, updateSet, options);
    return result;
  }
}

export default InventoryService;
