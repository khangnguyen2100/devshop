export type TProductType = 'clothing' | 'electronic' | 'furniture';

type TProduct = {
  productName: string;
  productThumb: string;
  productPrice: number;
  productQuantity: number;
  productDescription: string;
  productType: TProductType;
  productAttributes: object;

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
