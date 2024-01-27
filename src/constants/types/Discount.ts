type TDiscount = {
  discountName: string;
  discountCode: string;
  discountDescription: string;
  discountMaxUses: number;
  discountUsesCount: number;
  discountUsersUsed: string[];
  discountMaxUsesPerUser: number;
  discountMinOrderValue: number;
  discountIsActive: boolean;

  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  discountAppliesTo: 'ALL' | 'SPECIFIC';
  discountStartDate: string;
  discountEndDate: string;
  discountShopId: string;
  discountProductsId: string[];
};

export default TDiscount;
