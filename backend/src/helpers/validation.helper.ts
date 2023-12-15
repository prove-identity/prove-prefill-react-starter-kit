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