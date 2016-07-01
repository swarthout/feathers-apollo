import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-as-promised';

export default function verifyPassword(app, username, password) {
  return app.service('users').find({
    query: {
      username
    }
  }).then(users => {
    if (users && users[0]) {
      let user = users[0];
      const crypto = bcrypt;
      let hash = user.password;
      if (!hash) {
        return new Error(`User record in the database is missing a password`);
      }
      return crypto.compare(password, hash).then((result, error) => {
        if (error) {
          console.log('error', error);
        }
        if(result) {
          let secret = app.get('auth').token.secret;
          let token = jwt.sign({ _id: user._id }, secret, {});
          return {
            token,
            data: user
          }
        }
        return new Error(`Authentication failed`);
      });
    }
  });
}