import * as migration_20261102_070727_initial from './20261102_070727_initial';

export const migrations = [
  {
    up: migration_20261102_070727_initial.up,
    down: migration_20261102_070727_initial.down,
    name: '20261102_070727_initial'
  },
];
