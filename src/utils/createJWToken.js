import jwt from 'jsonwebtoken';

export default (user) => {
  let token = jwt.sign(
    {
      data: Object.entries(user).reduce((result, [key, value]) => {
          if (key !== 'password') result[key] = value;
          return result;
        },{})
    },
    process.env.JWT_SECRET || '',
    {
      expiresIn: process.env.JWT_MAX_AGE,
      algorithm: 'HS256',
    },
  );

  return token;
};