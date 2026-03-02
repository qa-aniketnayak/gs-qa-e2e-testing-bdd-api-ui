import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

function masterCsvPath(vehicleType: string, year: string) {
  return path.join(
    OUTPUT_DIR,
    `vehicle_styles_${vehicleType}_${year}.csv`
  );
}

function failureCsvPath(vehicleType: string, year: string) {
  return path.join(
    OUTPUT_DIR,
    `vehicle_styles_${vehicleType}_${year}_failures.csv`
  );
}

export function initCsv(vehicleType: string, year: string) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const masterHeader =
    vehicleType === 'rvs'
      ? 'Year,Manufacturer,Model,Trim,VehicleId\n'
      : 'Year,Manufacturer,Model,Trim,Style,VehicleId\n';

  fs.writeFileSync(
    masterCsvPath(vehicleType, year),
    masterHeader
  );

  fs.writeFileSync(
    failureCsvPath(vehicleType, year),
    'Year,Manufacturer,Model,Trim,FailureReason,Curl,Response\n'
  );
}

export function appendCsvRow(
  vehicleType: string,
  year: string,
  manufacturer: string,
  model: string,
  trim: string,
  style: string,
  vehicleId: string | number
) {
  const row =
    vehicleType === 'rvs'
      ? `${year},${manufacturer},${model},${trim},${vehicleId}\n`
      : `${year},${manufacturer},${model},${trim},${style},${vehicleId}\n`;

  fs.appendFileSync(masterCsvPath(vehicleType, year), row);
}

export function appendFailureRow(
  vehicleType: string,
  year: string,
  manufacturer: string,
  model: string,
  trim: string,
  reason: string,
  curl: string,
  response: string
) {
  const sanitizedCurl = curl.replace(/[\r\n]+/g, ' ');
  const sanitizedResponse = response.replace(/[\r\n]+/g, ' ');

  const row =
    `${year},${manufacturer},${model},${trim},${reason},` +
    `"${sanitizedCurl}","${sanitizedResponse}"\n`;

  fs.appendFileSync(failureCsvPath(vehicleType, year), row);
}

export function csvExists(vehicleType: string, year: string): boolean {
  return fs.existsSync(masterCsvPath(vehicleType, year));
}
