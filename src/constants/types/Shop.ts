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

export default Shop;
