import { RxDatabase } from 'rxdb';

import { MessageCollection, messageSchema } from './Message.schema';

export type DatabaseCollections = {
  messages: MessageCollection;
};

export type Database = RxDatabase<DatabaseCollections>;

export const schemas = {
  messages: {
    schema: messageSchema,
    autoMigrate: false,
    localDocuments: true,
    migrationStrategies: {},
  },
};
