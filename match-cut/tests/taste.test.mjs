import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResults, findMatches } from '../lib/taste.ts';

const shared = { a: 5, b: 4, c: 3, d: 4, e: 5 };
function viewer(name, ratings) {
  return { id: name, name, color: '', bio: '', demo: true, ratings };
}

test('four shared ratings do not establish a match', () => {
  assert.deepEqual(findMatches(shared, [viewer('A', { ...shared, e: null })]), []);
});

test('closer ratings rank higher with the same overlap', () => {
  const similar = viewer('Similar', { ...shared, a: 3 });
  const closest = viewer('Closest', shared);
  assert.deepEqual(findMatches(shared, [similar, closest]).map(m => m.id), ['Closest', 'Similar']);
});

test('only unseen films liked by a match become recommendations', () => {
  const twin = viewer('Twin', { ...shared, seen: 5, newFilm: 5, disliked: 2 });
  const result = buildResults({ ...shared, seen: null }, [twin]);
  assert.deepEqual(result.recommendations.map(r => r.filmId), ['newFilm']);
  assert.equal(result.recommendations[0].fans[0].name, 'Twin');
});
