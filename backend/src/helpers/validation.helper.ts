import * as _ from 'lodash';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { isIP } from 'net';

export function convertObjectKeysToSnakeCase(obj: { [key: string]: any }) {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const snakeCaseKey = _.snakeCase(key);
      newObj[snakeCaseKey] = obj[key];
    }
  }
  return newObj;
}

export function convertObjectKeysToCamelCase(obj: { [key: string]: any }): {
  [key: string]: any;
} {
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = _.camelCase(key);
      newObj[camelCaseKey] = obj[key];
    }
  }
  return newObj;
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  try {
    if (!phoneNumber) return false;
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'US');
    const isValid = parsedPhoneNumber?.isValid() || false;
    return isValid;
  } catch (error) {
    return false;
  }
}

export function validateSourceIP(sourceIP: string): boolean {
  return isIP(sourceIP) !== 0;
}
