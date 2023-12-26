import React, { useCallback, useEffect } from 'react';

import { Database } from './db/schema';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

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

    return () => {
      subscription.unsubscribe();
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
