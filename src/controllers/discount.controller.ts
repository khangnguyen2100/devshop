import { RequestHandler } from 'express';
import TDiscount from 'src/constants/types/Discount';
import { OK, SuccessResponse } from 'src/helpers/core/success.response';
import DiscountService from 'src/services/discount.service';
import getKeyStored from 'src/utils/getKeyStored';

class DiscountController {
  static getAllAvailableProductsByDiscountCodeInShop: RequestHandler = async (
    req,
    res,
  ) => {
    const { discountCode, shopId } = req.query;
    new OK({
      message: 'Get all available products by discount code successfully!',
      metadata: await DiscountService.getAllAvailableProductsByDiscountCode({
        shopId: shopId as string,
        discountCode: discountCode as string,
      }),
    }).send(res);
  };

  static getAllDiscountInShop: RequestHandler = async (req, res) => {
    const { page, limit, shopId } = req.query;
    new OK({
      message: 'Get all discount by shop successfully!',
      metadata: await DiscountService.getAllDiscountInShop(shopId as string, {
        page: Number(page) || undefined,
        limit: Number(limit) || undefined,
      }),
    }).send(res);
  };

  // authentication
  static createDiscountByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const newDiscount: TDiscount = {
      ...req.body,
      discountShopId: keyStored.user,
    };
    console.log('newDiscount:', newDiscount);

    new SuccessResponse({
      message: 'Create Discount successfully!',
      metadata: await DiscountService.createDiscountByShop(newDiscount),
    }).send(res);
  };
  static getDiscountAmountByUser: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);

    const { discountCode, cartProducts, shopId } = req.body;
    new OK({
      message: 'Get discount amount by user successfully!',
      metadata: await DiscountService.getDiscountAmountByUser({
        shopId: shopId as string,
        discountCode: discountCode as string,
        userId: keyStored.user,
        cartProducts: cartProducts as any[],
      }),
    }).send(res);
  };
  static deleteDiscountByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { discountId } = req.params;
    new OK({
      message: 'Delete discount successfully!',
      metadata: await DiscountService.deleteDiscountByShop(
        discountId,
        keyStored.user,
      ),
    }).send(res);
  };
  static cancelDiscountByUser: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);

    const { discountCode, shopId } = req.query;
    new OK({
      message: 'Delete discount successfully!',
      metadata: await DiscountService.cancelDiscountByUser({
        discountCode: discountCode as string,
        userId: keyStored.user,
        shopId: shopId as string,
      }),
    }).send(res);
  };
}

export default DiscountController;
