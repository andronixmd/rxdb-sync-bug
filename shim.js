import 'react-native-get-random-values';
import { shim } from 'react-native-quick-base64'
import { Buffer } from "buffer"

if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

shim();

process.browser = true;

global.Buffer = global.Buffer || Buffer;
