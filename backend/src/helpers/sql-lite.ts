import { Sequelize } from 'sequelize';
import path from 'path';
import config from '../../config/config.json';
import fs from 'fs';

const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/db/mydatabase.db'
    : path.join(__dirname, '/../../../db/mydatabase.db');
console.log('dbPath: ', dbPath);

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to true to see SQL queries in the console
});

async function checkDatabaseConnection() {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connected to the mydatabase.db database.');
    })
    .catch((err: any) => {
      console.error('Unable to connect to the database:', err);
    });
}

const modelsPath = path.join(__dirname, '../models');

fs.readdirSync(modelsPath)
  .filter((file: any) => file.endsWith('.js') || file.endsWith('.ts'))
  .forEach((file: any) => {
    const model = require(path.join(modelsPath, file)).default;
    model.init(sequelize);
    if ('associate' in model) {
      model.associate(sequelize.models);
    }
  });

export default checkDatabaseConnection;
