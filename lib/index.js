'use strict';

require('dotenv/config');

const dashify = require('dashify');
const { loadEnv } = require('./load-env');
const { functions } = require('./functions');
const { examples } = require('./examples');

const url = 'https://wordsapiv1.p.rapidapi.com/words';
const SPLIT_REGEX = /[\s\W]+/g;
const JOIN_CHARS = false;

const defaults = {
  model: 'gpt-4', // 'gpt-3.5-turbo-0613',
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
  // console.log({ joinChars, segments, parsed });

  if (joinChars && segments.length > 0) {
    for (const segment of segments) {
      for (const chars of [].concat(joinChars)) {
        array.push(segment.join(chars));
      }
    }
  }

  return [...new Set([...array, ...parsed])].sort();
};

const hasHyphenatedWords = words => {
  return words.some(word => word.includes('-'));
};

const sanitizeList = words => {
  return words.filter(word => !word.includes(' ') && word.split('-').length < 3);
};

const promptSynonyms = async ({
  apiKey = process.env.OPENAI_API_KEY,
  instructions = 'You are a helpful AI assistant that creates new words based on the words given by the user. You dislike creating words with hyphens, compound words, upper case letters, and space-separated phrases, and you avoid responding with commentary, explanations, disclaimers, or anything other than a comma-separated list of individual words.',
  messages,
  config
}) => {
  // const content = config?.model?.toLowerCase().startsWith('gpt-4')
  //   ? prompts.gpt4
  //   : prompts.gpt3;
  if (config?.criteria) {
    instructions += `\n\nCriteria: ${config.criteria}\n`;
    delete config.criteria;
  }

  if (instructions) {
    messages.unshift({ role: 'system', content: instructions });
  }

  // const matched = examples.find(ele => ele.name === 'examples');
  // const messages = [...matched.messages, { role: 'user', content: message }];

  // console.log(messages);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      ...defaults,
      ...config,
      messages
      // functions,
      // function_call: { name: 'get_similar_words' },
    })
  });

  if (!res.ok) {
    throw new Error(await res.text() || 'Failed to fetch the OpenAI response.');
  }

  if (!res.body) {
    throw new Error('The response body is empty.');
  }

  try {
    const { choices, ...data } = await res.json();
    const results = { ...data };

    results.input = messages;
    results.message = choices[0].message;

    if (results.message?.function_call) {
      const args = JSON.parse(results.message.function_call.arguments);
      results.synonyms = args.suggestions;

    } else {
      results.synonyms = results.message.content
        .split(',')
        .map(s => s.trim().replace(/\W+/g, '-'))
        .map(s => dashify(s).toLowerCase());
    }

    results.synonyms.sort();
    return results;
  } catch (error) {
    return { error, synonyms: [] };
  }
};

const fetchSynoyms = async (url, { synonyms: _, ...options }) => {
  try {
    const response = await fetch(url, options);

    if (response.statusText === 'Forbidden') {
      options.onError?.(response);
      return Promise.reject(new Error('Invalid API key'));
    }

    if (response.status !== 200) {
      if (response.status === 404 && response.statusText?.trim() === 'Not Found') {
        return response;
      }

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
  const env = loadEnv();
  const apiKey = options.apiKey || env.WORDS_API_KEY || process.env.WORDS_API_KEY;
  const openAIKey = options.openAIKey || env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const { join, split, ...opts } = options;
  const values = split ? splitWords(words, { join, split, ...opts }) : [].concat(words);
  const pending = new Set();
  const results = { synonyms: [], words: {} };

  const defaults = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  for (const word of values) {
    const endpoint = `${url}/${word}/synonyms`;
    const config = { ...defaults, ...opts };

    delete config.synonyms;

    const promise = fetchSynoyms(endpoint, config)
      .then(async res => {
        const data = await res.json();

        if (data.synonyms) {
          results.words[word] = data.synonyms;
          results.synonyms.push(...data.synonyms);
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

  await Promise.allSettled(pending);

  results.synonyms = [...new Set(results.synonyms)].sort();

  if (options.onSynonyms) {
    options.onSynonyms(results.synonyms);
  }

  if (options.openai) {
    // const list = sanitizeList(results.synonyms);
    // console.log({ results, list });
    const messages = [
      { role: 'user', content: 'completion, prompt' },
      { role: 'assistant', content: 'completions, completed, completer, completify, completely, prompter, promptly, promptastic, promptsy, prompio' },
      { role: 'user', content: values.join(', ') }
    ];

    // const concept = `Concept: ${values.join(', ')}`;
    // const example = `Example: ${list.slice(0, 10).join(', ')}`;
    // const message = `${concept}\n${example}`;

    // console.log({
    //   results,
    //   concept,
    //   example,
    //   message
    // });

    const config = options.openai === true ? {} : options.openai;
    const response = await promptSynonyms({ apiKey: openAIKey, messages, config });
    results.ai = response.synonyms;
  }

  return results;
};

module.exports = synonyms;
module.exports.synonyms = synonyms;
module.exports.splitWords = splitWords;
