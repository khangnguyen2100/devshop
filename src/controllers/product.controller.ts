import { RequestHandler } from 'express';
import TProduct, { TProductType } from 'src/constants/types/Product';
import { OK, SuccessResponse } from 'src/helpers/core/success.response';
import ProductService from 'src/services/product.service';
import getKeyStored from 'src/utils/getKeyStored';
import * as Yup from 'yup';
import { isObjectId, paginationSchema } from 'src/utils/validate';

class ProductController {
  static createProductByShopSchema = Yup.object().shape({
    body: Yup.object().shape({
      productName: Yup.string().required(),
      productDescription: Yup.string().required(),
      productThumb: Yup.string().required(),
      productPrice: Yup.number().required(),
      productQuantity: Yup.number().required(),
      productType: Yup.string().required(),
      productAttributes: Yup.object().required(),
    }),
  });
  static createProductByShop: RequestHandler = async (req, res) => {
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

  static updateProductByShopSchema = Yup.object().shape({
    body: Yup.object().shape({
      _id: isObjectId.required(),
      productName: Yup.string().optional(),
      productDescription: Yup.string().optional(),
      productThumb: Yup.string().optional(),
      productPrice: Yup.number().optional(),
      productQuantity: Yup.number().optional(),
      productType: Yup.string().optional(),
      productAttributes: Yup.object().optional(),
    }),
  });

  static updateProductByShop: RequestHandler = async (req, res) => {
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
  static getAllDraftByShopSchema = Yup.object().shape({
    query: paginationSchema,
  });
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

  static getAllPublishProductsInShopSchema = Yup.object().shape({
    query: paginationSchema,
    params: Yup.object().shape({
      shopId: isObjectId,
    }),
  });
  static getAllPublishProductsInShop: RequestHandler = async (req, res) => {
    const { page, limit } = req.query;
    const { shopId } = req.params;
    new OK({
      message: 'Get all publish products successfully!',
      metadata: await ProductService.findAllPublishProductsByShop(
        {
          productShop: shopId as string,
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
  static publishProductByShopSchema = Yup.object().shape({
    params: Yup.object().shape({
      productId: isObjectId,
    }),
  });
  static publishProductByShop: RequestHandler = async (req, res) => {
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

  static changeInventorySchema = Yup.object().shape({
    params: Yup.object().shape({
      productId: isObjectId,
    }),
    query: Yup.object().shape({
      quantity: Yup.number().required(),
    }),
  });
  static changeInventory: RequestHandler = async (req, res) => {
    const keyStored = getKeyStored(req);
    const { productId } = req.params;
    const { quantity } = req.query;
    new OK({
      message: 'Changed product inventory successfully!',
      metadata: await ProductService.changeInventory({
        productId,
        quantity: Number(quantity),
        userId: keyStored.user,
      }),
    }).send(res);
  };

  static unPublishProductByShopSchema = Yup.object().shape({
    params: Yup.object().shape({
      productId: isObjectId,
    }),
  });
  static unPublishProductByShop: RequestHandler = async (req, res) => {
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
  static searchProductByUserSchema = Yup.object().shape({
    query: Yup.object().shape({
      keyword: Yup.string().required(),
      ...paginationSchema.fields,
    }),
  });
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

  static getAllProductsSchema = Yup.object().shape({
    query: paginationSchema,
  });
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
  static getProductByIdSchema = Yup.object().shape({
    params: Yup.object().shape({
      productId: isObjectId,
    }),
    query: Yup.object().shape({
      unSelect: Yup.array().of(Yup.string()),
    }),
  });
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
