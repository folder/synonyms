#!/usr/bin/env node

const synonym = require('..');

const opts = {
  alias: {
    k: 'apiKey',
    j: 'join',
    s: 'split',
    v: 'version'
  }
};

const args = require('minimist')(process.argv.slice(2), opts);
const { _: names, ...options } = args;

if (args.version) {
  console.log('synonyms', `v${require('../package.json').version}`);
  process.exit(0);
}

synonym(names, options)
  .then(console.log)
  .catch(console.error);
