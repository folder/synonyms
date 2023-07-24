const assert = require('assert/strict');
const { synonyms, splitWords } = require('..');

describe('Synonyms', () => {
  describe('splitWords', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof splitWords, 'function');
    });

    it('should return an array', () => {
      const result = splitWords(['word']);
      assert.ok(Array.isArray(result));
    });

    it('should return split words', () => {
      const result = splitWords(['word-composite']);
      assert.ok(result.includes('word'));
      assert.ok(result.includes('composite'));
      assert.ok(result.includes('word-composite'));
    });

    it('should return individual segments of hyphen-separated words', () => {
      const input = ['foo-bar-baz'];
      const expectedOutput = ['foo', 'bar', 'baz', 'foo-bar-baz'];
      const result = splitWords(input);
      expectedOutput.forEach(word => assert.ok(result.includes(word)));
    });

    it('should return individual segments of space-separated words', () => {
      const input = ['foo bar baz'];
      const expectedOutput = ['foo', 'bar', 'baz', 'foo bar baz'];
      const result = splitWords(input);
      expectedOutput.forEach(word => assert.ok(result.includes(word)));
    });

    it('should re-join segments using the given join char', () => {
      const input = ['foo bar baz'];
      const expectedOutput = ['foo', 'bar', 'baz', 'foo bar baz', 'foo-bar-baz'];
      const result = splitWords(input, { join: '-' });
      expectedOutput.forEach(word => assert.ok(result.includes(word)));
    });

    it('should re-join segments using the given join chars', () => {
      const input = ['foo bar baz'];
      const expectedOutput = ['foo', 'bar', 'baz', 'foo bar baz', 'foo-bar-baz', 'foobarbaz'];
      const result = splitWords(input, { join: ['-', ''] });
      expectedOutput.forEach(word => assert.ok(result.includes(word)));
    });
  });

  describe('synonyms', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof synonyms, 'function');
    });

    it('should return an an object with arrays', async () => {
      const { all } = await synonyms('word');
      assert.ok(Array.isArray(all));
      assert.ok(all.length > 0);
    });

    it('should get synonyms for multiple words', async () => {
      const { words } = await synonyms(['happy', 'sad']);
      assert.ok(Array.isArray(words.happy));
      assert.ok(words.happy.length > 0);

      assert.ok(Array.isArray(words.sad));
      assert.ok(words.sad.length > 0);
    });
  });

  describe('split words', () => {
    it('should get synonyms for each word after splitting a word', async () => {
      const result = await synonyms('clean-cut', { split: true });
      const { words } = result;

      assert.ok(words['clean-cut'].includes('trim'));
      assert.ok(words['clean-cut'].includes('clear-cut'));

      assert.ok(words.clean.includes('neat'));
      assert.ok(words.clean.includes('fresh'));

      assert.ok(words.cut.includes('trim'));
      assert.ok(words.cut.includes('prune'));
    });
  });
});
