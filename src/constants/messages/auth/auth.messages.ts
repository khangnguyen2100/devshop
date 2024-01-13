const AUTH_MESSAGES = {
  // sign up
  SIGNUP_SUCCESS: 'Shop created successfully!',
  SIGNUP_ERROR: 'Create shop error',
  EMAIL_EXISTED: 'Email already exists',

  // login
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_ERROR: 'Login failed',
  SHOP_NOT_REGISTERED: 'Shop are not registered',
  PASSWORD_INCORRECT: 'Password is incorrect',
  NOT_LOGGED_IN: 'You are not logged in yet!',

  // logout
  TOKEN_INVALID:
    'Token is invalid or expired! Please login again to get a new one.',
  LOGOUT_SUCCESS: 'Logout successful',
  LOGOUT_ERROR: 'Logout failed',

  // refresh token
  REFRESH_TOKEN_SUCCESS: 'Create refresh token successfully!',
};

export default AUTH_MESSAGES;
