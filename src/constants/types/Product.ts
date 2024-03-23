import { Types } from 'mongoose';

export type TProductType = 'clothing' | 'electronic' | 'furniture';

type TProduct = {
  productName: string;
  productDescription?: string | null;
  productThumb: string;
  productPrice: number;
  productQuantity: number;
  productType: TProductType | string;
  productAttributes: object;
  createdBy: string | Types.ObjectId;
};
export type TProductInput = TProduct & {
  productId: string;
};
export type TProductResponse = TProduct & {
  _id: string | Types.ObjectId;
  productSlug: string | null;
  isDraft: boolean;
  isPublished: boolean;
  createdBy: {
    name: string;
    email: string;
    _id: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  productRatingAverage: number;
  productVariations: unknown[];
};

export type TClothing = {
  brand: string;
  size: string;
  material: string;
};
export type TElectronic = {
  manufacturer: string;
  modal: string;
  color: string;
};

export default TProduct;
