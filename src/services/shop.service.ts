import shopModel from 'src/models/shop.model';

class ShopService {
  static findById = async (userId: string) => {
    return shopModel.findById(userId);
  };
}
export default ShopService;
