import { Types } from 'mongoose';

export type TProductType = 'clothing' | 'electronic' | 'furniture';

type TProduct = {
  _id: string | Types.ObjectId;
  productName: string;
  productThumb: string;
  productPrice: number;
  productQuantity: number;
  productDescription?: string | null;
  productSlug?: string | null;
  productType: TProductType | string;
  productAttributes: object;
  productRatingAverage: number;
  productVariations: unknown[];
  isDraft: boolean;
  isPublished: boolean;

  createdBy: string | Types.ObjectId;
  createdAt: Date | string;
  updatedAt: Date | string;
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
