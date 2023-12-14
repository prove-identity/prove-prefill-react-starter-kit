// sequelize-config.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  logging: false, // Set to true to see SQL queries in the console
  // Add other configuration options here
});

export { sequelize };