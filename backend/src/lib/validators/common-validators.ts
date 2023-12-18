import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { isIP } from 'net';

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
