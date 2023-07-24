require('dotenv/config');

const url = 'https://wordsapiv1.p.rapidapi.com/words';
const SPLIT_REGEX = /[\s-]+/g;
const JOIN_CHARS = false;

const option = (value, fallback) => {
  if (value === false) return false;
  if (value === true) return fallback;
  return value ?? fallback;
};

const splitWords = (words = [], options = {}) => {
  const splitPattern = option(options.split, SPLIT_REGEX);
  const joinChars = option(options.join, JOIN_CHARS);
  const array = [].concat(words);
  const segments = [];

  for (const word of array.slice()) {
    const segs = word.split(splitPattern);

    if (segs.length > 1) {
      segments.push(segs);
    }

    for (const segment of segs) {
      if (!array.includes(segment)) {
        array.push(segment);
      }
    }
  }

  const parsed = array.flatMap(name => name.split(splitPattern).filter(Boolean));

  if (joinChars && segments.length > 0) {
    for (const segment of segments) {
      for (const chars of [].concat(joinChars)) {
        array.push(segment.join(chars));
      }
    }
  }

  return [...new Set([...array, ...parsed])].sort();
};

const synonyms = async (words = [], options = {}) => {
  const apiKey = options.apiKey || process.env.WORDS_API_KEY;
  const values = options?.split ? splitWords(words, options) : [].concat(words);
  const pending = new Set();
  const results = { all: [], words: {} };

  const defaults = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  for (const word of values) {
    const promise = await fetch(`${url}/${word}/synonyms`, { ...defaults, ...options })
      .then(async response => {
        const data = await response.json();

        if (data.synonyms) {
          results.words[word] = data.synonyms;
          results.all.push(...data.synonyms);
        } else {
          results.words[word] = [];
        }
      });

    pending.add(promise);
  }

  await Promise.all(pending);

  results.all = [...new Set(results.all)].sort();
  return results;
};

module.exports = synonyms;
module.exports.synonyms = synonyms;
module.exports.splitWords = splitWords;
