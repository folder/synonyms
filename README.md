# @folder/synonyms [![NPM version](https://img.shields.io/npm/v/@folder/synonyms.svg?style=flat)](https://www.npmjs.com/package/@folder/synonyms) [![NPM monthly downloads](https://img.shields.io/npm/dm/@folder/synonyms.svg?style=flat)](https://npmjs.org/package/@folder/synonyms) [![NPM total downloads](https://img.shields.io/npm/dt/@folder/synonyms.svg?style=flat)](https://npmjs.org/package/@folder/synonyms)

> Get synonyms for a word from OpenAI GPT-3 or GPT-4, or the WordsAPI. Optionally breaks hyphenated words into their parts and gets synonyms for each one. API and CLI.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save @folder/synonyms
```

## Getting started

Requires [Node.js](http://nodejs.org/), and an API key from [WordsAPI](https://www.wordsapi.com/).

**WordsAPI Usage**

Pass your `apiKey` as an option, or set it as an environment variable on `WORDS_API_KEY` (handy if you're using the [CLI](#cli)).

**OpenAI Usage**

Pass your `openAIKey` as an option, or set it as an environment variable on `OPENAI_API_KEY` (handy if you're using the [CLI](#cli)).

## API

### Usage

```js
const { synonyms } = require('@folder/synonyms');

const words = await synonyms(['foo', 'bar']);
console.log(words);
```

### synonyms

Get synonyms from the [WordsAPI](https://www.wordsapi.com/).

**Signature**

```ts
synonyms(word: string | string[], options: object): Promise<Array<string>>
```

**Example**

```js
const { synonyms } = require('@folder/synonyms');

// pass a string or array of words
const results = await synonyms(['fork', 'knife']);
console.log(results.all); //=> list of all synonyms
console.log(results.fork); //=> ['divide', 'split', 'diverge', ...]
console.log(results.knife); //=> ['blade', 'cutlery', 'dagger', ...]
```

#### Options

| **Option** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `openAIKey` | `string` | N/A | Your OpenAI API key. If not provided, the function will attempt to read from a `OPENAI_API_KEY` environment variable. |
| `apiKey` | `string` | N/A | Your WordsAPI key from RapidAPI. If not provided, the function will attempt to read from a `WORDS_API_KEY` environment variable. |
| `split` | `string\|regex\|boolean` | `[\s-]+` | Determines if [splitWords](#splitWords) should be used. |
| `join` | `string\|string[]\|boolean` | `false` | Passed to [splitWords](#splitWords) when `split` is defined. |

### openai

**Type**: `boolean` | `object` - If `true`, the OpenAI API will be used. If an object, the object will be passed to the OpenAI API as options.

**Default**: `false`

**Example**:

```js
process.env.OPENAI_API_KEY = 'your API key here'; // or just pass it on the options

const { synonyms } = require('@folder/synonyms');

// pass openai=true on the options, to tell the library you want to use the OpenAI API
const results = await synonyms('fabulous', {
  openAIKey,
  // by default 'gpt-3.5-turbo-0613' is used
  openai: { model: 'gpt-4-0613' } // pass any other OpenAI options you want
});

// the returned object is a different shape than the WordsAPI results
console.log(results);
```

Results in:

```js
{
  id: 'chatcmpl-7fruBWZKtSBI4q8sPawHNeANVtZ0D',
  object: 'chat.completion',
  created: 1690213015,
  model: 'gpt-3.5-turbo-0613',
  usage: { prompt_tokens: 84, completion_tokens: 20, total_tokens: 104 },
  input: 'fabulous',
  message: {
    role: 'assistant',
    content: 'fantastic, marvelous, amazing, incredible, superb, outstanding, excellent, terrific, splendid, sensational'
  },
  synonyms: [
    'fantastic', 'marvelous',
    'amazing',   'incredible',
    'superb',    'outstanding',
    'excellent', 'terrific',
    'splendid',  'sensational'
  ]
}
```

**Example phrase**

```js
synonyms('5 words that mean "mildly fabulous"', { openai: true });

// Results in:
{
  id: 'chatcmpl-7frv8JUMOiI7ptvguI6pS3nZNzCS5',
  object: 'chat.completion',
  created: 1690213074,
  model: 'gpt-3.5-turbo-0613',
  usage: { prompt_tokens: 92, completion_tokens: 12, total_tokens: 104 },
  input: '5 words that mean "mildly fabulous"',
  message: {
    role: 'assistant',
    content: 'charming, delightful, lovely, enchanting, winsome'
  },
  synonyms: [ 'charming', 'delightful', 'lovely', 'enchanting', 'winsome' ]
}
```

### splitWords

The `splitWords` function breaks down compound words into individual words using either the provided splitting pattern or a default pattern (`/[\s-]+/g`).

```js
const { splitWords } = require('@folder/synonyms');
console.log(splitWords('foo-bar'));
//=> ['foo', 'bar', 'foo-bar', 'bar-foo']
console.log(splitWords(['foo-bar', 'baz-qux']));
//=> ['foo', 'bar', 'foo-bar', 'baz', 'qux', 'baz-qux']
```

#### Options

| **Option** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| `split` | `string\|regex\|boolean` | `[\s-]+`| A string or regex to use for splitting words. |
| `join` | `string\|string[]\|boolean` | `false` | A string to re-join the expanded words. For example, given `join: ''`, `foo-bar` will return `foobar`. This is useful when trying to get synonyms for compound or hyphenated words |

## CLI

Install globally with [npm](https://www.npmjs.com/):

```sh
npm install @folder/synonyms --global
```

### Usage

```sh
synonyms <word> [options]
```

### Options

| **Option** | **Alias** | **Description** |
| --- | --- | --- |
| `--apiKey` | `-k` | A string representing the user's RapidAPI key. If not provided, the function will attempt to read from a `WORDS_API_KEY` environment variable. |
| `--split` | `-s` | Determines if [splitWords](#splitWords) should be used. |
| `--join` | `-j` | Passed to [splitWords](#splitWords) when `split` is defined. |

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

[get-pkg](https://www.npmjs.com/package/get-pkg): Get the package.json for a project from npm. | [homepage](https://github.com/jonschlinkert/get-pkg "Get the package.json for a project from npm.")

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2023, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the MIT License.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on July 24, 2023._
