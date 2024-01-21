import { Types, isValidObjectId } from 'mongoose';
import { COMMON_MESSAGES } from 'src/constants/messages';
import TProduct, { TProductType } from 'src/constants/types/Product';
import { TPaginationQuery } from 'src/constants/types/common';
import { BadRequestError } from 'src/helpers/core/error.response';
import productModel, {
  clothingModel,
  electronicModel,
  furnitureModel,
} from 'src/models/product.model';
import {
  findProductById,
  publishProductByShop,
  queryProduct,
  searchProductsByUser,
  unPublishProductByShop,
  updateProductById,
} from 'src/models/repositories/product.repo';

// define product base class
class ProductBase {
  productName: string;
  productThumb: string;
  productPrice: number;
  productQuantity: number;
  productDescription: string;
  productType: TProductType;
  productAttributes: object;
  createdBy: string;

  constructor(props: TProduct) {
    const {
      productName,
      productThumb,
      productPrice,
      productQuantity,
      productDescription,
      productType,
      productAttributes,
      createdBy,
    } = props;

    this.productName = productName;
    this.productThumb = productThumb;
    this.productPrice = productPrice;
    this.productQuantity = productQuantity;
    this.productDescription = productDescription;
    this.productType = productType;
    this.productAttributes = productAttributes;
    this.createdBy = createdBy;
  }

  async createProduct(productId: Types.ObjectId) {
    return await productModel.create({
      ...this,
      _id: productId,
    });
  }

  async updateProduct(productId: string, payload: any) {
    return await updateProductById({
      productId: productId,
      model: productModel,
      payload,
    });
  }
}

// define sub-class for different product type
class ClothingBase extends ProductBase {
  async createProduct() {
    const newClothing = await clothingModel.create(this.productAttributes);
    if (!newClothing)
      throw new BadRequestError('create Clothing product failed!');

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError('create Product failed!');

    return newProduct;
  }

  async updateProduct(productId: string) {
    if (this.productAttributes) {
      await updateProductById({
        productId: productId,
        model: clothingModel,
        payload: this.productAttributes,
      });
    }
    const updatedProduct = await super.updateProduct(productId, this);
    return updatedProduct;
  }
}
class ElectronicBase extends ProductBase {
  async createProduct() {
    const newElectronic = await electronicModel.create(this.productAttributes);
    if (!newElectronic)
      throw new BadRequestError('create Electronic product failed!');

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError('create Product failed!');

    return newProduct;
  }

  async updateProduct(productId: string) {
    if (this.productAttributes) {
      await updateProductById({
        productId: productId,
        model: electronicModel,
        payload: this.productAttributes,
      });
    }
    const updatedProduct = await super.updateProduct(productId, this);
    return updatedProduct;
  }
}
class FurnitureBase extends ProductBase {
  async createProduct() {
    const newFurniture = await furnitureModel.create(this.productAttributes);
    if (!newFurniture)
      throw new BadRequestError('create Furniture product failed!');

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError('create Product failed!');

    return newProduct;
  }

  async updateProduct(productId: string) {
    if (this.productAttributes) {
      await updateProductById({
        productId: productId,
        model: furnitureModel,
        payload: this.productAttributes,
      });
    }
    const updatedProduct = await super.updateProduct(productId, this);
    return updatedProduct;
  }
}
// end define sub-class

// main product class
class ProductFactory {
  static productRegistry: any = {};

  static registerProductType = (type: TProductType, classRef: any) => {
    this.productRegistry[type] = classRef;
  };

  static createProduct = async (type: TProductType, payload: TProduct) => {
    const ProductClass = this.productRegistry[type];

    if (!ProductClass) {
      throw new BadRequestError(`Invalid Product type: ${type}`);
    }
    if (!payload) {
      throw new BadRequestError(COMMON_MESSAGES.MISSING_REQUIRED_FIELD);
    }

    return new ProductClass(payload).createProduct();
  };
  static updateProduct = async (type: TProductType, payload: TProduct) => {
    const ProductClass = this.productRegistry[type];

    if (!ProductClass) {
      throw new BadRequestError(`Invalid Product type: ${type}`);
    }
    if (!payload._id) {
      throw new BadRequestError('Product Id is required');
    }

    return new ProductClass(payload).updateProduct(payload._id);
  };

  static publishProductByShop = async (productId: string, userId: string) => {
    if (!isValidObjectId(productId)) {
      throw new BadRequestError('Product Id is not valid');
    }
    const updatedProduct = await publishProductByShop({
      productId,
      productShop: userId,
    });
    if (!updatedProduct) {
      throw new BadRequestError('Publish product failed!');
    }
  };
  static unPublishProductByShop = async (productId: string, userId: string) => {
    if (!isValidObjectId(productId)) {
      throw new BadRequestError('Product Id is not valid');
    }
    const updatedProduct = await unPublishProductByShop({
      productId,
      productShop: userId,
    });
    if (!updatedProduct) {
      throw new BadRequestError('Unpublish product failed!');
    }
  };

  // QUERY
  static findAllProductsByUser = async (pagination: TPaginationQuery) => {
    const query = {
      isPublished: true,
    };
    return await queryProduct({ query, ...pagination });
  };
  static findAllDraftsProductsByShop = async (
    {
      productShop,
    }: {
      productShop: string;
    },
    pagination: TPaginationQuery,
  ) => {
    const query = {
      createdBy: productShop,
      isDraft: true,
    };
    return await queryProduct({ query, ...pagination });
  };
  static findAllPublishProductsByShop = async (
    {
      productShop,
    }: {
      productShop: string;
    },
    pagination: TPaginationQuery,
  ) => {
    const query = {
      createdBy: productShop,
      isPublished: true,
    };
    return await queryProduct({ query, ...pagination });
  };
  static searchProductsByUser = async (
    { keyword }: { keyword: string },
    pagination: TPaginationQuery,
  ) => {
    return await searchProductsByUser({ keyword, ...pagination });
  };
  static findProductById = async (
    { productId }: { productId: string },
    { unSelect = [] }: { unSelect?: string[] },
  ) => {
    if (!isValidObjectId(productId)) {
      throw new BadRequestError('Product Id is not valid');
    }
    const result = await findProductById(
      {
        productId,
      },
      { unSelect },
    );
    return result;
  };
}

// register product type
ProductFactory.registerProductType('clothing', ClothingBase);
ProductFactory.registerProductType('electronic', ElectronicBase);
ProductFactory.registerProductType('furniture', FurnitureBase);

export default ProductFactory;
