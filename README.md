# @folder/synonyms

Get synonyms of a word and derive possible name expansions.

## Usage

```js
const synonyms = require("@folder/synonyms");
```

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install @folder/synonyms --save
```

## API

### synonyms

Get an array of synonyms for given word.

```js
const { synonyms } = require("@folder/synonyms");

// synonyms(word: string, config: object): Promise<Array<string>>
synonyms("happy")
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
```

### expandNames

Expand names produces an array with various combinations of words extracted from a hyphen-separated word.

```js
const { expandNames } = require("@folder/synonyms");

// expandNames(names: Array<string>, config: object): Array<string>
const expandedNames = expandNames(["word-composite"]);
console.log(expandedNames); // outputs: ['word', 'composite', 'word-composite', 'composite-word']
```

### expandSynonyms

Expand synonyms produces an array of synonyms for all words in the array of names passed, it also accepts an options object which can contain a `limit`(default 50) for maximum synonyms and a flag `synonyms` to indicate if the synonyms api needs to be called.

```js
const { expandSynonyms } = require("@folder/synonyms");

// expandSynonyms(names: Array<string>, options: object): Promise<Array<string>>
expandSynonyms(["happy", "sad"], { limit: 10, synonyms: true })
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
```

