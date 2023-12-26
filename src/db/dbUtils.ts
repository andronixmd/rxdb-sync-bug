import { addRxPlugin, removeRxDatabase } from 'rxdb';

import { Database, schemas } from './schema';

import { createDb, dbStorage } from './index';

import('rxdb/plugins/dev-mode').then((module) => addRxPlugin(module.RxDBDevModePlugin));

export const dropDatabase = async () => {
  console.log('dropDatabase()');
  try {
    await removeRxDatabase('react-native-sqlite', dbStorage);
  } catch (error) {
    console.error('dropDatabase() | failed', { error });
  }
};

export const initializeDb = async () => {
  let db: Database | undefined;
  let newMigrations = true;

  console.log('initializeDb() | Adding collections...');
  try {
    db = await createDb();
    if (db) {
      const collections: any = await db.addCollections(schemas);
      const result = await Promise.all(
        Object.keys(collections).map((key) => collections[key].migrationNeeded()),
      );
      newMigrations = result.some((m) => m);

      if (newMigrations) {
        await Promise.all(
          Object.keys(collections).map((key) => collections[key].migratePromise(100)),
        );
      }
      console.log('initializeDb() | Added collections');
    }
  } catch (error) {
    if (db && db.collections) {
      await Promise.all(
        Object.keys(db.collections).map((collection) => db?.removeCollection(collection)),
      );
    }
    console.error('initializeDb() | Adding collections failed', {
      error,
    });
  }

  return { db, newMigrations };
};
