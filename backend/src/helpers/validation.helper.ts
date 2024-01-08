import * as _ from 'lodash';

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
