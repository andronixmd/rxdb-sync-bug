require('./shim');
import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { init } from './src';

AppRegistry.registerRunnable(appName, async (initialProps) => {
  const App = await init();
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, initialProps);
});
