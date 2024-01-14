import { Types } from 'mongoose';
import { COMMON_MESSAGES } from 'src/constants/messages';
import TProduct, { TProductType } from 'src/constants/types/Product';
import { BadRequestError } from 'src/helpers/core/error.response';
import productModel, {
  clothingModel,
  electronicModel,
  furnitureModel,
} from 'src/models/product.model';

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
}

// register product type
ProductFactory.registerProductType('clothing', ClothingBase);
ProductFactory.registerProductType('electronic', ElectronicBase);
ProductFactory.registerProductType('furniture', FurnitureBase);

export default ProductFactory;
