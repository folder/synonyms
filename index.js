require('dotenv/config');

const url = 'https://wordsapiv1.p.rapidapi.com/words';
const defaults = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
  }
};

const synonyms = async (word, config = {}) => {
  const { limit } = config;
  const result = [];

  const recurse = async value => {
    if (Array.isArray(value)) {
      const words = value.filter(w => !w.includes('-'));

      for (const w of words) {
        const data = await synonyms(w, config);

        result.push(...data);

        if (limit && result.length >= limit) {
          return result;
        }
      }

      return result;
    }

    const response = await fetch(`${url}/${value}/synonyms`, { ...defaults, ...config });
    const data = await response.json();
    return data.synonyms ? data.synonyms.filter(w => !w.includes(' ')) : [];
  };

  return recurse(word);
};

const expandNames = (names = [], config = {}) => {
  const { separator = '-' } = config;
  const expanded = new Set();

  for (const name of names) {
    const segments = name.split(separator);
    for (let i = 0; i < segments.length; i++) {
      expanded.add(segments.slice(0, i + 1).join(separator));
      expanded.add(segments.slice(0, i + 1).reverse().join(separator));

      if (i > 0) {
        const rotated = segments.slice(i).concat(segments.slice(0, i));
        expanded.add(rotated.join(separator));
        expanded.add(rotated.reverse().join(separator));
      }
    }
  }

  return [...expanded].sort();
};

const expandSynonyms = async (names = [], options = {}) => {
  const limit = options.limit || 50;
  const expanded = expandNames(names, options);

  if (options.synonyms) {
    const results = await Promise.all(expanded.map(name => synonyms(name, options)));
    expanded.push(...results.flat().filter(w => !w.includes(' ')));
  }

  return [...new Set(expanded)].slice(0, limit);
};

module.exports = {
  expandNames,
  expandSynonyms,
  synonyms
};
