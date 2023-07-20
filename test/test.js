const assert = require('assert/strict');
const { synonyms, expandNames, expandSynonyms } = require('..');

describe('Synonyms', () => {
  describe('synonyms', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof synonyms, 'function');
    });

    it('should return an array', async () => {
      const result = await synonyms('word');
      assert.ok(Array.isArray(result));
      assert.ok(result.length > 0);
    });

    it('should return words without spaces', async () => {
      const result = await synonyms('word');
      result.forEach(word => assert.ok(!word.includes(' ')));
    });
  });

  describe('expandNames', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof expandNames, 'function');
    });

    it('should return an array', () => {
      const result = expandNames(['word']);
      assert.ok(Array.isArray(result));
    });

    it('should return names without words containing "-"', () => {
      const result = expandNames(['word-composite']);
      assert.ok(result.includes('word'));
      assert.ok(result.includes('composite'));
      assert.ok(result.includes('word-composite'));
      assert.ok(result.includes('composite-word'));
    });

    it('should return individual segments of hyphen-separated words', () => {
      const input = ['word-composite'];
      const expectedOutput = ['word', 'composite'];
      const result = expandNames(input);
      expectedOutput.forEach(word => assert.ok(result.includes(word)));
    });
  });

  describe('expandSynonyms', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof expandSynonyms, 'function');
    });

    it('should return an array', async () => {
      const result = await expandSynonyms(['word']);
      assert.ok(Array.isArray(result));
    });

    it('should return words without spaces', async () => {
      const result = await expandSynonyms(['word']);
      result.forEach(word => assert.ok(!word.includes(' ')));
    });

    it('should limit the result based on provided limit', async () => {
      const limit = 10;
      const result = await expandSynonyms(['word'], { limit });
      assert(result.length <= limit);
    });
  });
});
