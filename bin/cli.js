#!/usr/bin/env node

const colors = require('ansi-colors');
const update = require('log-update');
const { checkPackages } = require('..');

const names = process.argv.slice(2);
const state = {};

const { cyan: c, dim, gray, green: g, red: r } = colors;
const { check, cross } = colors.symbols;

if (names.length === 0) {
  console.log(colors.red('Please provide package names'));
  process.exit(1);
}

const render = () => {
  let count = state.names.length;
  const output = [];

  for (const name of state.names) {
    const exists = state.checks[name];

    switch (String(exists)) {
      case 'true':
        output.push(['', g(check), name].join(' '));
        break;

      case 'false':
        output.push(['', r(cross), name].join(' '));
        break;

      case 'null':
      default: {
        count--;
        output.push(['', gray.dim(cross), dim(name)].join(' '));
        break;
      }
    }
  }

  const s = count === 1 ? '' : 's';
  output.push('', `Checked ${c(count)} package${s}`, '');
  state.output = output.join('\n');
};

const interval = setInterval(() => {
  update(state.output);
}, 250);

checkPackages(names, {
  synonyms: 50,
  onBefore(names = []) {
    console.log();
    state.names = names.slice();
    state.checks = {};

    for (const name of names.sort()) {
      state.checks[name] = null;
    }

    render();
  },
  onResult: ({ name, exists }) => {
    state.checks[name] = exists;
    state.finished = true;
    clearInterval(interval);
    render();
    update(state.output);
  }
});
