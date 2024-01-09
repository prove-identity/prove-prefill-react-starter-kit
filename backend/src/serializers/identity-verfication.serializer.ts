export class IdentityResponseBuilder {
  private response: any;

  constructor() {
    this.response = {};
  }

  public static create() {
    return new IdentityResponseBuilder();
  }

  public setData(data: any) {
    this.response.data = data;
    return this;
  }

  public setName(name: string) {
    this.response.name = name;
    return this;
  }

  public setStatus(status: number) {
    this.response.status = status;
    return this;
  }

  public setStatusText(statusText: string) {
    this.response.statusText = statusText;
    return this;
  }

  public setHeaders(headers: any) {
    this.response.headers = headers;
    return this;
  }

  public setConfig(config: any) {
    this.response.config = config;
    return this;
  }

  public build() {
    return { ...this.response };
  }
}
