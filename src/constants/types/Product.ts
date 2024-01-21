export type TProductType = 'clothing' | 'electronic' | 'furniture';

type TProduct = {
  _id: string;
  productName: string;
  productThumb: string;
  productPrice: number;
  productQuantity: number;
  productDescription: string;
  productSlug: string;
  productType: TProductType;
  productAttributes: object;
  productRatingAverage: number;
  productVariations: unknown[];
  isDraft: boolean;
  isPublished: boolean;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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
