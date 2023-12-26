import React, { useCallback, useEffect } from 'react';

import { Database } from './db/schema';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 40,
  },
  text2: {
    color: 'white',
    fontSize: 20,
  },
});

const App = ({ initialDb: db }: { initialDb: Database }) => {
  const [inProgress, setInProgress] = React.useState(false);
  const [messagesCount, setMessagesCount] = React.useState(0);

  const createRecords = useCallback(async () => {
    if (inProgress) return;

    setInProgress(true);
    for (let i = 0; i < 100; i++) {
      const date = new Date();

      date.setTime(date.getTime() + i * 1000);

      const ts = date.toISOString();

      await db.messages.atomicUpsert({
        id: date.getTime().toString(),

        content: `Message ${ts}`,
        type: i % 2 === 0 ? 'text' : 'audio',
        status: 'success',
        active: true,

        createdAt: ts,
        updatedAt: ts,
      });
    }
    setInProgress(false);
    Alert.alert('Done');
  }, [db, inProgress]);

  useEffect(() => {
    const subscription = db.messages.find().$.subscribe((messages) => {
      setMessagesCount(messages.length);
    });

    const replication = db.messages.syncGraphQL({
      url: 'http://localhost:8123/v1/graphql',

      pull: {
        queryBuilder: (doc: any) => {
          if (!doc) {
            doc = {
              id: '',
              updatedAt: new Date(0).toISOString(),
            };
          }

          const query = `{
            messages(
              where: {
                _and: [
                  {
                    _or: [
                      {
                        updatedAt: {
                          _gt: "${doc.updatedAt}"
                        }
                      },
                      ${
                        doc.id
                          ? `{
                          updatedAt: {_eq: "${doc.updatedAt}"},
                          id: {_gt: "${doc.id}"}
                        }`
                          : ''
                      }
                    ]
                  }
                ]
              },
              order_by: {updatedAt: asc},
              limit: 20
            ) {
              id
              content
              status
              type
              active
              createdAt
              updatedAt
            }
          }`;

          return {
            query,
            variables: {},
          };
        },
        batchSize: 20,
      },
      push: {
        queryBuilder: (docs: any[]) => {
          const query = `
            mutation InsertMessages($messages: [messages_insert_input!]!) {
              insert_messages(
                objects: $messages,
                on_conflict: {
                  constraint: messages_pkey,
                  update_columns: [content, status, active]
                }){
                returning {
                  id
                  content
                  status
                  type
                  active
                  createdAt
                  updatedAt
                }
              }
            }
        `;

          const messages = docs
            .filter((doc) => !doc.deleted)
            .map((doc) => {
              const message: any = {
                id: doc.id,

                content: doc.content,

                status: doc.status,
                type: doc.type,

                active: !!doc.active,
              };

              return message;
            });

          const variables = {
            messages,
          };

          return {
            query,
            variables,
          };
        },
        batchSize: 20,
      },
      live: true,
      liveInterval: 0,
      deletedFlag: 'deleted',
    });

    replication.error$.subscribe((err) => {
      console.error('replication error', JSON.stringify(err, null, 2));
    });

    const wsClient = new SubscriptionClient('ws://localhost:8123/v1/graphql', {
      reconnect: true,
      timeout: 1000 * 60,
      connectionCallback: (error) => {
        console.log('setupSubscription() | connection', {
          error,
        });
      },
      reconnectionAttempts: 10000,
      inactivityTimeout: 0,
      lazy: true,
    });

    const ret = wsClient.request({
      query: `subscription onMessageChanged {
        messages(
          order_by: {updatedAt: desc},
          limit: 1,
        ) {
          id
          content
          status
          type
          active
          createdAt
          updatedAt
        }
      }`,
    });

    ret.subscribe({
      next() {
        console.log('setupSubscription() | subscription emitted => trigger run');
        replication.run(true);
      },
      error: (error) => {
        console.error('setupSubscription() | failed', {
          error,
        });
      },
    });

    return () => {
      subscription.unsubscribe();
      replication.cancel();

      wsClient.unsubscribeAll();
      // @ts-ignore
      wsClient.reconnect = false;
      wsClient.close(true, true);
    };
  }, [db]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World!</Text>
      <Text style={styles.text2}>Messages: {messagesCount}</Text>
      <Button onPress={createRecords} title="Create Records" disabled={inProgress} />
    </View>
  );
};

export default React.memo(App);
