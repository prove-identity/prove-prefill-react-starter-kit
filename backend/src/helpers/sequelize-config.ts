// sequelize-config.js
import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/db/mydatabase.db'
    : path.join(__dirname, '/../../../db/dev.sqlite');
console.log('dbPath: ', dbPath);
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to true to see SQL queries in the console
  // Add other configuration options here
});

export { sequelize };
