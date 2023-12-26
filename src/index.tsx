import React from 'react';

import App from './App';
import { dropDatabase, initializeDb } from './db/dbUtils';
import { Database } from './db/schema';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

export const init = async () => {
  let db: Database | undefined = undefined;
  let newMigrations = false;

  // try 3 times to initialize db
  for (let i = 0; i < 3; i++) {
    const result = await initializeDb();
    if (!!result.db && !!result.db.collections) {
      db = result.db;
      newMigrations = result.newMigrations;
      break;
    }
  }

  // if db was not initialized
  if (!db) {
    await dropDatabase();
    const result = await initializeDb();
    if (!!result.db && !!result.db.collections) {
      db = result.db;
      newMigrations = true;
    }
  }

  return () => (
    <React.StrictMode>
      <App initialDb={db!} />
    </React.StrictMode>
  );
};
