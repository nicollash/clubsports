import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
  ICognitoUserData,
} from 'amazon-cognito-identity-js';
import jwt from 'jsonwebtoken';

global.fetch = require('node-fetch');

let token = '';

let tokenExpiration = 0;

export const authUser = async () => {
  if (!token || new Date().getTime() / 1000 > tokenExpiration) {
    token = await authenticateUser();
    const decodedToken: any = jwt.decode(token);
    tokenExpiration = decodedToken.exp;
    console.log(JSON.stringify(decodedToken));
  }

  return token;
};
async function authenticateUser() {
  var userName = process.env.PRIVATE_API_ADMIN_USERNAME!;
  var password = process.env.PRIVATE_API_ADMIN_PASSWORD!;

  const poolData = {
    UserPoolId: process.env.AWS_USER_POOL_ID!,
    ClientId: process.env.AWS_USER_POOL_CLIENT_ID!,
  };

  const userPool = new CognitoUserPool(poolData);

  var authenticationDetails = new AuthenticationDetails({
    Username: userName,
    Password: password,
  });

  var userData: ICognitoUserData = {
    Username: userName,
    Pool: userPool,
  };

  var cognitoUser = new CognitoUser(userData);

  const idToken: string = await new Promise((resolve, reject) =>
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        console.log(idToken);
        resolve(idToken);
      },
      onFailure: (err) => {
        console.log(err);
        reject(err);
      },
    })
  );
  return idToken;
}
