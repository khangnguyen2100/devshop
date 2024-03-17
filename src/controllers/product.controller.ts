import { RequestHandler } from 'express';
import TProduct, { TProductType } from 'src/constants/types/Product';
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
        product.productType as TProductType,
        product,
      ),
    }).send(res);
  };

  static updateProduct: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const product: TProduct = {
      ...req.body,
      createdBy: keyStored.user,
    };
    new SuccessResponse({
      message: 'Update Product successfully!',
      metadata: await ProductService.updateProduct(
        product.productType as TProductType,
        product,
      ),
    }).send(res);
  };

  // QUERY

  /**
   * @description Get all draft products by shop
   * @param {Number} page - default 1
   * @param {Number} limit - default 50
   * @param {Number} sort - default asc
   */

  static getAllDraftByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { page, limit } = req.query;
    new OK({
      message: 'Get all draft products successfully!',
      metadata: await ProductService.findAllDraftsProductsByShop(
        {
          productShop: keyStored.user,
        },
        {
          page: Number(page) || undefined,
          limit: Number(limit) || undefined,
        },
      ),
    }).send(res);
  };

  static getAllPublishByShop: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { page, limit } = req.query;
    new OK({
      message: 'Get all publish products successfully!',
      metadata: await ProductService.findAllPublishProductsByShop(
        {
          productShop: keyStored.user,
        },
        {
          page: Number(page) || undefined,
          limit: Number(limit) || undefined,
        },
      ),
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
      metadata: await ProductService.publishProductByShop(
        productId,
        keyStored.user,
      ),
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
   * @param {Number} page - default 1
   * @param {Number} limit - default 50
   */

  static searchProductByUser: RequestHandler = async (req, res) => {
    const { keyword, page, limit } = req.query;

    new OK({
      message: 'Search product successfully!',
      metadata: await ProductService.searchProductsByUser(
        {
          keyword: keyword?.toString() || '',
        },
        {
          page: Number(page) || undefined,
          limit: Number(limit) || undefined,
        },
      ),
    }).send(res);
  };
  /**
   * @description get all products from every shop
   */
  static getAllProducts: RequestHandler = async (req, res) => {
    const { page, limit, sort, select } = req.query;
    const defaultSelect = [
      'productName',
      'productDescription',
      'productPrice',
      'productQuantity',
      'isPublished',
    ];

    new OK({
      message: 'Get all products successfully!',
      metadata: await ProductService.findAllProductsByUser({
        page: Number(page) || undefined || undefined,
        limit: Number(limit) || undefined || undefined,
        sort: sort?.toString() === 'desc' ? 'desc' : 'asc',
        select:
          Number(select?.length) > 0 ? (select as string[]) : defaultSelect,
      }),
    }).send(res);
  };

  /**
   * @description Get product by id
   * @param {ObjectId} productId
   */

  static getProductById: RequestHandler = async (req, res) => {
    const { productId } = req.params;
    const { unSelect } = req.query;
    new OK({
      message: 'Get product',
      metadata: await ProductService.findProductById({
        productId,
        unSelect: Number(unSelect?.length) > 0 ? (unSelect as string[]) : [],
      }),
    }).send(res);
  };
}

export default ProductController;
