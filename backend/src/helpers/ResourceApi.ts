// import { API_URL_BASE } from '@src/helpers/(constants)/ResourceApiConstants';
interface ApiResponse {
  body: any;
  status: number;
  success: boolean;
}

export default class ResourceApi {
  private API_URL_BASE: string;
  private requestStartAt!: number; // Initialize as undefined
  private oauth: boolean;
  private authParams: { [key: string]: string };

  constructor() {
    this.API_URL_BASE = 'https://api.staging.payfone.com';
    this.oauth = false;
    this.authParams = {};
  }

  private logResponse(request: string, response: any): void {
    const requestDoneAt = Date.now();
    console.log(
      `[API-REQUESTS] Completed response ${response} in ${
        requestDoneAt - this.requestStartAt
      }ms`,
    );
  }

  private logRequest(request: string, method: string): void {
    this.requestStartAt = Date.now();
    console.log(
      `[API-REQUESTS] Started request http method: ${method} ${request} at ${new Date().toISOString()}`,
    );
  }

  private async processResponse(rawResponse: Response): Promise<ApiResponse> {
    const response: ApiResponse = {
      body: {},
      status: rawResponse.status,
      success: false,
    };

    const contentType = rawResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      response.body = await rawResponse.json();
    }

    if (rawResponse.ok) {
      response.success = true;
    }

    return response;
  }

  private async decideRequestSubmissionType(
    url: string,
    params: any,
    type: string,
  ): Promise<Response> {
    const headers: { [key: string]: string } = {
      'Accept': 'application/json',
      'cache-control': 'no-cache',
    };

    let body: string | FormData = JSON.stringify(params);
    if (type === 'form_url_encoded') {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(params).toString();
    } else {
      headers['content-type'] = 'application/json';
    }

    if (this.oauth) {
      for (const [key, value] of Object.entries(this.authParams)) {
        headers[key] = value;
      }
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    };

    return await fetch(url, requestOptions);
  }

  public setAuthParams(params: { [key: string]: string }): void {
    this.authParams = params;
  }

  public setOAuth(oauth: boolean): void {
    this.oauth = oauth;
  }

  public async post(endpoint: string, body: any): Promise<ApiResponse> {
    const url = new URL(endpoint, this.API_URL_BASE).toString();
    this.logRequest(url, 'post');

    try {
      const rawResponse = await this.decideRequestSubmissionType(
        url,
        body,
        'raw',
      );
      const response = await this.processResponse(rawResponse);
      this.logResponse(url, response);
      return response;
    } catch (error) {
      console.error(
        `[${endpoint}] body: ${JSON.stringify(body)}, response: ${error}`,
      );
      throw error;
    }
  }

  public async get(
    endpoint: string,
    queryParams: { [key: string]: string },
  ): Promise<ApiResponse> {
    const url = new URL(endpoint, this.API_URL_BASE);
    url.search = new URLSearchParams(queryParams).toString();
    const urlString = url.toString();
    this.logRequest(urlString, 'get');

    try {
      const rawResponse = await this.buildGetCurl(urlString);
      const response = await this.processResponse(rawResponse);
      this.logResponse(urlString, response);
      return response;
    } catch (error) {
      console.error(
        `[${endpoint}] queryParams: ${JSON.stringify(
          queryParams,
        )}, response: ${error}`,
      );
      throw error;
    }
  }

  private async buildGetCurl(url: string): Promise<Response> {
    const headers: { [key: string]: string } = {
      'Accept': 'application/json',
      'cache-control': 'no-cache',
    };

    if (this.oauth) {
      for (const [key, value] of Object.entries(this.authParams)) {
        headers[key] = value;
      }
    }

    const requestOptions: RequestInit = {
      method: 'GET',
      headers,
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      // Adjust other fetch options as needed
    };

    return await fetch(url, requestOptions);
  }
}
// Usage example:
// const api = new ResourceApi();
// api.setOAuth(true);
// api.setAuthParams({ Authorization: 'Bearer YOUR_ACCESS_TOKEN' });
//
// // Making a POST request
// const postResponse = await api.post('/your-endpoint', {
//   /* your post data */
// });
// console.log('POST Response:', postResponse);
//
// // Making a GET request with URL params
// const getResponse = await api.get('/your-endpoint', {
//   /* your get query params */
// });
// console.log('GET Response:', getResponse);
