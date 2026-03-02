import { request, APIRequestContext } from '@playwright/test';
import { BASE_URL } from '../../../config/urls';

export class ApiClient {
  private context!: APIRequestContext;

  async init() {
    this.context = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Content-Type': 'application/json' }
    });
  }

  getContext() {
    return this.context;
  }
}