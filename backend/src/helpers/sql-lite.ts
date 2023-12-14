// db.js
import { sequelize } from './sequelize-config';
import path from 'path';
import fs from 'fs';

async function connectToDB() {
  try {
    await sequelize.authenticate();

    await initDBModels();
    console.log('Connected to the mydatabase.db database.');
    syncModels();
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}

async function initDBModels() {
  const modelsPath = path.join(__dirname, '../models');

  fs.readdirSync(modelsPath)
    .filter((file) => file.endsWith('.js') || file.endsWith('.ts'))
    .forEach(async (file) => {
      const model = require(path.join(modelsPath, file)).default;
      await model.init({}, { sequelize });
      await model.sync();
      if ('associate' in model) {
        model.associate(sequelize.models);
      }
    });
}

const syncModels = async () => {
  try {
    // Sync all defined models to the database
    await sequelize.sync({ alter: true }); // This option will make necessary alterations without dropping tables
    console.log('Models synced successfully');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
};

export { initDBModels, connectToDB };
