import { Given } from '@cucumber/cucumber';
import { ApiClient } from '../../api/clients/apiClient';

export let vehicleContext: {
  vehicleType?: 'autos' | 'rvs';
  year?: string;
  apiClient?: ApiClient;
  headers?: Record<string, string>;
} = {};

Given('vehicle type is {string}', async function (type: string) {
  if (type !== 'autos' && type !== 'rvs') {
    throw new Error(`Invalid vehicle type: ${type}`);
  }
  vehicleContext.vehicleType = type;
});

Given('vehicle year is {string}', async function (value: string) {
  vehicleContext.year = value;

  vehicleContext.headers = {
    Cookie: [
      'application_id=199',
      'application_revision=167',
      'customer_reference=153',
      'customer_state=NY',
      'gs_program=VSC',
      'provider_reference=4'
    ].join('; ')
  };

  vehicleContext.apiClient = new ApiClient();
  await vehicleContext.apiClient.init();
});
