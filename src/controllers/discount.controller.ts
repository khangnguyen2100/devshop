import { RequestHandler } from 'express';
import { CartProductInput } from 'src/constants/types/Cart';
import TDiscount from 'src/constants/types/Discount';
import { OK, SuccessResponse } from 'src/helpers/core/success.response';
import DiscountService from 'src/services/discount.service';
import getKeyStored from 'src/utils/getKeyStored';
import {
  isObjectId,
  paginationSchema,
  yupArray,
  yupObject,
} from 'src/utils/validate';
import * as Yup from 'yup';
class DiscountController {
  static getAllAvailableProductsByDiscountCodeInShopSchema = yupObject({
    query: yupObject({
      discountCode: Yup.string().required(),
      shopId: Yup.string().required(),
    }),
  });
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

  static getAllDiscountInShopSchema = yupObject({
    query: yupObject({
      ...paginationSchema.fields,
      shopId: isObjectId.required(),
    }),
  });
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
  static createDiscountByShopSchema = yupObject({
    body: yupObject({
      discountName: Yup.string().required(),
      discountCode: Yup.string().required(),
      discountMaxUses: Yup.number().min(1).required(),
      discountMaxUsesPerUser: Yup.number().min(1).required(),
      discountMinOrderValue: Yup.number().min(0).required(),
      discountType: Yup.string().oneOf(['PERCENT', 'FIXED']).required(),
      discountValue: Yup.number().min(0).required(),
      discountAppliesTo: Yup.string().required(),
      discountEndDate: Yup.date().required(),
    }),
  });
  static createDiscountByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const newDiscount: TDiscount = {
      ...req.body,
      discountShopId: keyStored.user,
    };

    new SuccessResponse({
      message: 'Create Discount successfully!',
      metadata: await DiscountService.createDiscountByShop(newDiscount),
    }).send(res);
  };

  static getDiscountAmountByUserSchema = yupObject({
    body: yupObject({
      shopId: isObjectId.required(),
      cartProducts: yupArray(
        yupObject({
          productId: isObjectId.required(),
          shopId: isObjectId.required(),
          quantity: Yup.number().required(),
        }),
      ),
      discountCode: Yup.string().required(),
    }),
  });
  static getDiscountAmountByUser: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);

    const { discountCode, cartProducts, shopId } = req.body;
    new OK({
      message: 'Get discount amount by user successfully!',
      metadata: await DiscountService.getDiscountAmountByUser({
        shopId: shopId as string,
        discountCode: discountCode as string,
        userId: keyStored.user,
        cartProducts: cartProducts as CartProductInput[],
      }),
    }).send(res);
  };

  static deleteDiscountByShopSchema = yupObject({
    params: yupObject({
      discountId: isObjectId.required(),
    }),
  });
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

  static cancelDiscountByUserSchema = yupObject({
    query: yupObject({
      discountCode: Yup.string().required(),
      shopId: isObjectId.required(),
    }),
  });
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
