// sequelize-config.js
import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/db/prod.sqlite'
    : path.join(__dirname, '/../../../db/dev.sqlite');
console.log('dbPath: ', dbPath);
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
  // Add other configuration options here
});

export { sequelize };