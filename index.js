'use strict';

require('dotenv/config');

const url = 'https://wordsapiv1.p.rapidapi.com/words';
const SPLIT_REGEX = /[\s-]+/g;
const JOIN_CHARS = false;

const defaults = {
  model: 'gpt-3.5-turbo-0613',
  temperature: 1,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  n: 1
};

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

const promptSynonyms = async ({
  apiKey = process.env.OPENAI_API_KEY,
  words = [],
  config
}) => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      ...defaults,
      ...config,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Return a list of comma-separated synonyms or words that are similar to what the user requests. You strongly prefer single word synonyms, compound words, or words with a dash; and you avoid phrases with multiple words separated by spaces. You strongly dislike adding any commentary, explanations, descriptions, or other words that are not synonyms.'
        },
        {
          role: 'user',
          content: [].concat(words).join(', ')
        }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(await res.text() || 'Failed to fetch the chat response.');
  }

  if (!res.body) {
    throw new Error('The response body is empty.');
  }

  const { choices, ...data } = await res.json();
  const result = { ...data };

  result.input = [].concat(words).join(', ');
  result.message = choices[0].message;
  result.synonyms = result.message.content.split(',').map(s => s.trim());
  return result;
};

const fetchSynoyms = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (response.statusText === 'Forbidden') {
      options.onError?.(response);
      return Promise.reject(new Error('Invalid API key'));
    }

    if (response.status !== 200) {
      options.onError?.(response);
      return Promise.reject(new Error(`Invalid response: ${response.status}`));
    }

    return response;
  } catch (error) {
    options.onError?.({ error });
    return Promise.reject(error);
  }
};

const synonyms = async (words = [], options = {}) => {
  const apiKey = options.apiKey || process.env.WORDS_API_KEY;
  const openAIKey = options.openAIKey || process.env.OPENAI_API_KEY;
  const values = options?.split ? splitWords(words, options) : [].concat(words);
  const pending = new Set();
  const results = { all: [], words: {} };

  if (options.openai) {
    const config = options.openai === true ? {} : options.openai;
    return promptSynonyms({ apiKey: openAIKey, words: values, config });
  }

  const defaults = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  for (const word of values) {
    const promise = fetchSynoyms(`${url}/${word}/synonyms`, { ...defaults, ...options })
      .then(async res => {
        const data = await res.json();

        if (data.synonyms) {
          results.words[word] = data.synonyms;
          results.all.push(...data.synonyms);
        } else {
          results.words[word] = [];
        }

        return res;
      })
      .catch(err => {
        console.log(err);
        return Promise.reject(err);
      });

    pending.add(promise);
  }

  const res = await Promise.allSettled(pending);
  console.log(res);

  results.all = [...new Set(results.all)].sort();
  return results;
};

module.exports = synonyms;
module.exports.synonyms = synonyms;
module.exports.splitWords = splitWords;
