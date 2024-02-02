import { sequelize } from './sequelize-config';
import { models, modelConfigs } from '../models'; // Update the path accordingly

async function connectToDB() {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');
    await initDBModels();
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}

async function initDBModels() {
  for (const modelName in models) {
    //@ts-ignore
    const model = models[modelName] as any;
    //@ts-ignore
    const modelConfig = modelConfigs[`${modelName
      .charAt(0)
      .toLowerCase()}${modelName.slice(1)}Config`]; 
      
    await model.init(modelConfig, { sequelize });

    if (process.env.NODE_ENV !== 'production') {
      await model.sync({ alter: true });
    }

    if (typeof model.associate === 'function') {
      model.associate(sequelize.models);
    }
  }
}

export { initDBModels, connectToDB };

