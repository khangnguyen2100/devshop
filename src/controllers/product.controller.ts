import { RequestHandler } from 'express';
import TProduct from 'src/constants/types/Product';
import { SuccessResponse } from 'src/helpers/core/success.response';
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
}

export default ProductController;
