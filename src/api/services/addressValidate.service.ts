import { APIRequestContext } from '@playwright/test';

export class AddressValidateService {
  constructor(private request: APIRequestContext) {}

  async validateAddress(
    payload: Record<string, any>,
    headers: Record<string, string>
  ) {
    return this.request.post('/api/esp/address/validate', {
      headers,
      data: payload
    });
  }
}
