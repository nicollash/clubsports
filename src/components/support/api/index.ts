import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const BASE_URL = process.env.ZENDESK_URL || "https://clubsportshelp.zendesk.com/api/v2/";

class TicketApi {
  baseUrl: string | any;
  instance: AxiosInstance;

  constructor() {
    this.baseUrl = BASE_URL;
    this.instance = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }
  async createTicket(data: any) {
    console.log('[zendesk url]', BASE_URL)
    let url = 'requests.json'
    return await this.instance.post(url, data)
      .then(this.handleResponse)
      .catch(this.handleError)
  }

  private handleResponse(response: AxiosResponse) {
    return response?.data;
  }
  private handleError(err: AxiosError) {
    // tslint:disable-next-line: no-console
    console.error('Error:', err);
  }
}

export default new TicketApi();