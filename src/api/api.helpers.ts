import { Auth } from "aws-amplify";

const getToken = async () => {
  const userToken = (await Auth.currentSession()).getIdToken().getJwtToken();

  return userToken;
};

const getUserInfo = async () => {
  const userInfo = await Auth.currentUserInfo();
  return userInfo;
};

export { getToken, getUserInfo };
