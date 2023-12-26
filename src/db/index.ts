// @ts-ignore
import * as PouchdbAdapterHttp from 'pouchdb-adapter-http';
// @ts-ignore
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
// @ts-ignore
import SQLite from 'react-native-sqlite-2';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBAttachmentsPlugin } from 'rxdb/plugins/attachments';
import { RxDBCleanupPlugin } from 'rxdb/plugins/cleanup';
import { RxDBEncryptionPlugin } from 'rxdb/plugins/encryption';
import { RxDBKeyCompressionPlugin } from 'rxdb/plugins/key-compression';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';

import { Database, DatabaseCollections } from './schema';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);

addPouchPlugin(SQLiteAdapter);
addPouchPlugin(PouchdbAdapterHttp);
addRxPlugin(RxDBReplicationGraphQLPlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBLocalDocumentsPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBAttachmentsPlugin);
addRxPlugin(RxDBCleanupPlugin);
addRxPlugin(RxDBEncryptionPlugin);
addRxPlugin(RxDBKeyCompressionPlugin);

export const dbStorage = getRxStoragePouch('react-native-sqlite', {
  auto_compaction: true,
  revs_limit: 1,
});

export const createDb = async () => {
  let db: Database | undefined;

  try {
    console.log('createDb() | Initializing database...');

    db = await createRxDatabase<DatabaseCollections>({
      name: 'react-native-sqlite',
      storage: dbStorage,
      password: 'react-native-sqlite',
      multiInstance: false,
      eventReduce: true,
      localDocuments: true,
      ignoreDuplicate: true,
      options: {
        auto_compaction: true,
        revs_limit: 1,
      },
      cleanupPolicy: {
        /**
         * The minimum time in milliseconds for how long
         * a document has to be deleted before it is purged by the cleanup.
         */
        minimumDeletedTime: 1000 * 60 * 60 * 24 * 1, // 1 day,
        /**
         * The minimum amount of that that the RxCollection must have existed.
         * This ensures that at the initial page load, more important
         * tasks are not slowed down because a cleanup process is running.
         */
        minimumCollectionAge: 1000 * 60 * 2, // 2 minutes
        /**
         * After the initial cleanup is done,
         * a new cleanup is started after [runEach] milliseconds
         */
        runEach: 1000 * 60 * 5, // 5 minutes
        awaitReplicationsInSync: true,
        waitForLeadership: true,
      },
    });
    console.log('createDb() | Database initialized!');
  } catch (error) {
    console.error('createDb() | failed', { error });
  }
  return db;
};
