import { Given } from '@cucumber/cucumber';
import { ApiClient } from '../../api/clients/apiClient';
import { vehicleContext } from './vehicle.common.steps';
import { DefaultHeaders } from '../../api/headers/defaultHeaders';

Given('API client is initialized', async function () {
  vehicleContext.headers = DefaultHeaders.get();

  vehicleContext.apiClient = new ApiClient();
  await vehicleContext.apiClient.init();
});
