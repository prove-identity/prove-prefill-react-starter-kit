import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/usr/src/app/db/mydatabase.db'
    : path.join(__dirname, '/../../../db/mydatabase.db');
console.log('dbPath: ', dbPath);

const sequelize = new Sequelize({
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

export default checkDatabaseConnection;
