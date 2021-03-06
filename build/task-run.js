// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/* eslint no-console: 0 */

import { spawn } from 'child_process';
import path from 'path';

import * as BuildUtils from './utils';

export default (args = []) => new Promise((resolve, reject) => {
  const manifest = BuildUtils.getManifest();
  const command = BuildUtils.getElectronPath();
  const script = path.join(__dirname, '..', manifest.main);

  console.log(`Executing command: ${command}`);

  const child = spawn(command, [script, ...args], {
    stdio: 'inherit',
  });

  child.on('error', reject);
  child.on('exit', (code) => {
    if (code !== 0) {
      reject(new Error(`Exited with exit code ${code}`));
    } else {
      resolve();
    }
  });
});
