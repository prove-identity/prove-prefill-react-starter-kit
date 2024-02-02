// sequelize-config.js
import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'production'
    ? '../db/prod.sqlite'
    : path.join(__dirname, '/../../../db/dev.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

export { sequelize };
