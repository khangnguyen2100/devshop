import bcrypt from 'bcryptjs';
import lodash from 'lodash';
import { shopRole } from 'src/constants/enums/shop';
import storeTokens from 'src/helpers/auth/storeTokens';
import {
  BadRequestError,
  UnauthorizedError,
} from 'src/helpers/core/error.response';
import shopModel from 'src/models/shop.model';

type SignUpBody = {
  name: string | null;
  email: string | null;
  password: string | null;
};
type LoginBody = {
  email: string | null;
  password: string | null;
  refreshToken: string | null;
};

class AuthService {
  static signUp = async (body: SignUpBody) => {
    const { name, email, password } = body;

    if (!name || !email || !password) {
      throw new BadRequestError('Missing required fields');
    }
    // Check if email already exists
    const findShop = await shopModel.findOne({ email }).lean();
    if (findShop) {
      throw new BadRequestError('Email already exists');
    }

    // create new shop
    const newShop = await shopModel.create({
      name,
      email: email.toLowerCase(),
      password,
      roles: [shopRole.VIEW],
    });
    if (!newShop) {
      throw new BadRequestError('Create shop error');
    }

    // generate and store tokens
    const payload = {
      userId: newShop._id.toString(),
      email: newShop.email,
      roles: newShop.roles,
    };
    const { accessToken, refreshToken } = await storeTokens(
      payload,
      newShop._id.toString(),
    );

    return {
      data: lodash.pick(newShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
      refreshToken,
    };
  };

  static login = async (body: LoginBody) => {
    // Check inputs
    const {
      email: enteredEmail,
      password: enteredPassword,
      refreshToken: currentRefreshToken,
    } = body;
    if (!enteredEmail || !enteredPassword) {
      throw new BadRequestError('Missing required fields');
    }

    // Check if email in db
    const findShop = await shopModel
      .findOne({ email: enteredEmail })
      .select('+password')
      .lean();
    if (!findShop) {
      throw new UnauthorizedError('Email are not registered');
    }

    // Compare password
    const isPwMatch = await bcrypt.compare(enteredPassword, findShop.password);
    if (!isPwMatch) {
      throw new UnauthorizedError('Password is incorrect');
    }

    // generate and store tokens
    const payload = {
      userId: findShop._id.toString(),
      email: findShop.email,
      roles: findShop.roles,
    };
    const { accessToken, refreshToken } = await storeTokens(
      payload,
      findShop._id.toString(),
      currentRefreshToken,
    );

    return {
      data: lodash.pick(findShop, ['_id', 'name', 'email', 'roles']),
      accessToken,
      refreshToken,
    };
  };
}
export default AuthService;
