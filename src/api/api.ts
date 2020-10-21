import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Auth } from 'aws-amplify';
import { getToken } from './api.helpers';

const BASE_URL = process.env.REACT_APP_API_BASE_URL!;

class Api {
  baseUrl: string;
  instance: AxiosInstance;

  constructor() {
    this.baseUrl = BASE_URL;
    this.instance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get(url: string, params?: any) {
    await this.checkAuthToken();

    return await this.instance
      .get(url, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
        params,
      })
      .then(this.handleResponse)
      .catch(this.handleError);
  }

  async post(url: string, data: any) {
    return await this.instance
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      })
      .then(this.handleResponse)
      .catch(this.handleError);
  }

  async put(url: string, data: any) {
    return await this.instance
      .put(url, data, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      })
      .then(this.handleResponse)
      .catch(this.handleError);
  }

  async delete(url: string, data?: any) {
    return await this.instance
      .delete(url, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
        data,
      })
      .then(this.handleResponse)
      .catch(this.handleError);
  }

  private handleResponse(response: AxiosResponse) {
    return response?.data;
  }

  private handleError(err: AxiosError) {
    // tslint:disable-next-line: no-console
    console.error('Error:', err);
  }

  private async checkAuthToken() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const currentSession = await Auth.currentSession();
      const tokenExpiration = currentSession.getIdToken().getExpiration();
      const currentTimeInSecond = Math.ceil(+Date.now() / 1000);

      if (currentTimeInSecond >= tokenExpiration) {
        cognitoUser.refreshSession(
          currentSession.getRefreshToken(),
          (_: any, session: any) => {
            const { idToken } = session;
            localStorage.setItem('token', idToken.jwtToken);
          }
        );
      }
    } catch (error) {
      console.error('Unable to refresh Token', error);
    }
  }
}

export default new Api();
