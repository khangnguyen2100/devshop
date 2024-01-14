import { COMMON_MESSAGES } from 'src/constants/messages';
import TProduct, { TProductType } from 'src/constants/types/Product';
import { BadRequestError } from 'src/helpers/core/error.response';
import productModal, { clothingModel } from 'src/models/product.modal';

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

  async createProduct() {
    return await productModal.create(this);
  }
}

// define sub-class for different product type
class ClothingBase extends ProductBase {
  async createProduct() {
    const newClothing = await clothingModel.create(this.productAttributes);
    if (!newClothing)
      throw new BadRequestError('create Clothing product failed!');

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError('create Product failed!');

    return newProduct;
  }
}

class ElectronicBase extends ProductBase {
  async createProduct() {
    const newElectronic = await clothingModel.create(this.productAttributes);
    if (!newElectronic)
      throw new BadRequestError('create Electronic product failed!');

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError('create Product failed!');

    return newProduct;
  }
}
// end define sub-class

// main product class
class ProductFactory {
  static createProduct = async (type: TProductType, payload: TProduct) => {
    if (!type || !payload) {
      throw new BadRequestError(COMMON_MESSAGES.MISSING_REQUIRED_FIELD);
    }
    switch (type) {
      case 'clothing':
        return new ClothingBase(payload);
        break;
      case 'electronic':
        return new ElectronicBase(payload);
        break;
      default:
        throw new BadRequestError(`Invalid Product type: ${type}`);
    }
  };
}

export default ProductFactory;
