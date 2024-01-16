import { RequestHandler } from 'express';
import TProduct from 'src/constants/types/Product';
import { OK, SuccessResponse } from 'src/helpers/core/success.response';
import ProductService from 'src/services/product.service';
import getKeyStored from 'src/utils/getKeyStored';

class ProductController {
  static createProduct: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const product: TProduct = {
      ...req.body,
      createdBy: keyStored.user,
    };
    new SuccessResponse({
      message: 'Create Product successfully!',
      metadata: await ProductService.createProduct(
        product.productType,
        product,
      ),
    }).send(res);
  };

  // QUERY

  /**
   * @description Get all draft products by shop
   * @param {Number} skip - default 0
   * @param {Number} limit - default 50
   */

  static getAllDraftByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { skip, limit } = req.query;
    new OK({
      message: 'Get all draft products successfully!',
      metadata: await ProductService.findAllDraftsProductsByShop({
        productShop: keyStored.user,
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
    }).send(res);
  };

  /**
   * @description Get all draft products by shop
   * @param {Number} skip - default 0
   * @param {Number} limit - default 50
   */

  static getAllPublishByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { skip, limit } = req.query;
    new OK({
      message: 'Get all publish products successfully!',
      metadata: await ProductService.findAllPublishProductsByShop({
        productShop: keyStored.user,
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
    }).send(res);
  };
  /**
   * @description Publish status to true
   * @param {ObjectId} productId
   */

  static publishProduct: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { productId } = req.params;
    new OK({
      message: 'Publish product successfully!',
      metadata: await ProductService.publishProductByShop(productId, keyStored.user),
    }).send(res);
  };
  static unPublishProduct: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { productId } = req.params;
    new OK({
      message: 'Unpublish product successfully!',
      metadata: await ProductService.unPublishProductByShop(
        productId,
        keyStored.user,
      ),
    }).send(res);
  };

    /**
   * @description Search product by name, description
   * @param {String} keyword - default ""
   * @param {Number} skip - default 0
   * @param {Number} limit - default 50
   */

  static searchProductByUser: RequestHandler = async (req, res) => {
    const { keyword, skip, limit } = req.query;

    new OK({
      message: 'Search product successfully!',
      metadata: await ProductService.searchProducts({
        keyword: keyword?.toString() || '',
        skip: skip ? Number(skip) : undefined,
        limit: limit ? Number(limit) : undefined,
      }),
    }).send(res);
  };
}

export default ProductController;
