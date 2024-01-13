type Shop = {
  _id: string;
  name: string;
  email: string;
  password?: string;
  status: 'active' | 'inactive';
  verify: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};
export type JWTPayload = {
  userId: string;
  email: string;
  roles: string[];
};
export default Shop;
