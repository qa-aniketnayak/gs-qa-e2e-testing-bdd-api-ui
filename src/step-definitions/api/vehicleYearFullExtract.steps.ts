import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { vehicleContext } from './vehicle.common.steps';
import { AutoYearsService } from '../../api/services/autoYears.service';
import { ManufacturersService } from '../../api/services/manufacturers.service';
import { ModelsService } from '../../api/services/models.service';
import { TrimsService } from '../../api/services/trims.service';
import { StylesService } from '../../api/services/styles.service';
import {
  initCsv,
  appendCsvRow,
  appendFailureRow,
  csvExists
} from '../../utils/csvWriter';

const BASE_URL =
  'https://gs-unified-web-git-feat-checkout-coverage-camping-world.vercel.app';

When(
  'I extract complete vehicle hierarchy for the year',
  { timeout: 30 * 60 * 1000 },
  async function () {
    const { apiClient, headers, year, vehicleType } = vehicleContext;
    const request = apiClient!.getContext();

    initCsv(vehicleType!, year!);

    await new AutoYearsService(request).getYears(headers!, vehicleType!);

    const manufacturersRes =
      await new ManufacturersService(request).getManufacturers(
        year!,
        headers!,
        vehicleType!
      );

    const manufacturers: string[] =
      (await manufacturersRes.json()).manufacturers;

    for (const manufacturer of manufacturers) {
      const modelsRes =
        await new ModelsService(request).getModels(
          year!,
          manufacturer,
          headers!,
          vehicleType!
        );

      const models: string[] = (await modelsRes.json()).models;

      if (!models || models.length === 0) {
        appendCsvRow(
          vehicleType!,
          year!,
          manufacturer,
          'NOT AVAILABLE',
          'NOT AVAILABLE',
          'NOT AVAILABLE',
          'NOT AVAILABLE'
        );
        continue;
      }

      for (const model of models) {
        const trimsRes =
          await new TrimsService(request).getTrims(
            year!,
            manufacturer,
            model,
            headers!,
            vehicleType!
          );

        const trimBody = await trimsRes.json();

        /* ===================== RVS FLOW ===================== */
        if (vehicleType === 'rvs') {
          const trimsDetails = trimBody.trimsDetails || [];

          const endpoint =
            `/api/esp/rvs/year/${year}/manufacturer/${manufacturer}` +
            `/model/${model}`;

          const curl =
            `curl -X GET "${BASE_URL}${endpoint}" ` +
            `-H "Cookie: ${headers!.Cookie}"`;

          for (const item of trimsDetails) {
            const trim = item.model;
            const vehicleId = item.vehicleId ?? 'NOT AVAILABLE';

            appendCsvRow(
              vehicleType!,
              year!,
              manufacturer,
              model,
              trim,
              'NOT AVAILABLE',
              vehicleId
            );

            if (!item.vehicleId) {
              appendFailureRow(
                vehicleType!,
                year!,
                manufacturer,
                model,
                trim,
                'VEHICLE_ID_NOT_AVAILABLE',
                curl,
                JSON.stringify(trimBody)
              );
            }
          }
          continue;
        }

        /* ===================== AUTOS FLOW ===================== */
        const trims: string[] = trimBody.trims;

        if (!trims || trims.length === 0) {
          appendCsvRow(
            vehicleType!,
            year!,
            manufacturer,
            model,
            'NOT AVAILABLE',
            'NOT AVAILABLE',
            'NOT AVAILABLE'
          );
          continue;
        }

        const stylePromises = trims.map(async (trim: string) => {
          const endpoint =
            `/api/esp/${vehicleType}/year/${year}/manufacturer/${manufacturer}` +
            `/model/${model}/trim/${trim}`;

          const response =
            await new StylesService(request).getStyles(
              year!,
              manufacturer,
              model,
              trim,
              headers!,
              vehicleType!
            );

          const body = await response.json();

          const curl =
            `curl -X GET "${BASE_URL}${endpoint}" ` +
            `-H "Cookie: ${headers!.Cookie}"`;

          return { trim, styles: body.styles, curl, raw: body };
        });

        const results = await Promise.all(stylePromises);

        for (const result of results) {
          const { trim, styles, curl, raw } = result;

          if (!styles || styles.length === 0) {
            appendCsvRow(
              vehicleType!,
              year!,
              manufacturer,
              model,
              trim,
              'NOT AVAILABLE',
              'NOT AVAILABLE'
            );

            appendFailureRow(
              vehicleType!,
              year!,
              manufacturer,
              model,
              trim,
              'NO_STYLES_RETURNED',
              curl,
              JSON.stringify(raw)
            );
            continue;
          }

          styles.forEach((item: any) => {
            const style = item.style ?? 'NOT AVAILABLE';
            const vehicleId = item.vehicleId ?? 'NOT AVAILABLE';

            appendCsvRow(
              vehicleType!,
              year!,
              manufacturer,
              model,
              trim,
              style,
              vehicleId
            );

            if (style === 'NOT AVAILABLE' || vehicleId === 'NOT AVAILABLE') {
              appendFailureRow(
                vehicleType!,
                year!,
                manufacturer,
                model,
                trim,
                'MISSING_STYLE_OR_VEHICLE_ID',
                curl,
                JSON.stringify(item)
              );
            }
          });
        }
      }
    }
  }
);

Then('vehicle CSV should be generated', async function () {
  const { vehicleType, year } = vehicleContext;
  expect(csvExists(vehicleType!, year!)).toBeTruthy();
});
